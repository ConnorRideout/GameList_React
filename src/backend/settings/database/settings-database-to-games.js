/* eslint-disable no-console */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import knex from 'knex'

const config = require('../../../../knexfile')

// knex configurations
const settingsDbConfig = config.settings

const gamesDbConfig = config.development

async function transferSettingsData() {
  const settingsDb = knex(settingsDbConfig);
  const gamesDb = knex(gamesDbConfig);

  try {
    console.log('Starting data transfer process...\n');

    // Get all tables from settings database
    const settingsTables = await settingsDb.raw(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    console.log('Found tables in settings database:', settingsTables.map(t => t.name));

    // Get all tables from games database that start with 'settings_'
    const gamesTables = await gamesDb.raw(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name LIKE 'settings_%'
    `);

    console.log('Found settings tables in games database:', gamesTables.map(t => t.name));

    // Create mapping of old table -> new table
    const tableMap = new Map();

    settingsTables.forEach(settingsTable => {
      const settingsTableName = settingsTable.name;
      const expectedGamesTableName = `settings_${settingsTableName}`;

      // Check if corresponding table exists in games database
      const gamesTableExists = gamesTables.some(gt => gt.name === expectedGamesTableName);

      if (gamesTableExists) {
        tableMap.set(settingsTableName, expectedGamesTableName);
        console.log(`Mapping: ${settingsTableName} -> ${expectedGamesTableName}`);
      } else {
        console.log(`⚠️  No matching table found for ${settingsTableName} (expected ${expectedGamesTableName})`);
      }
    });

    if (tableMap.size === 0) {
      console.log('❌ No matching tables found. Make sure your games database has the settings_ prefixed tables.');
      return;
    }

    console.log(`\n🚀 Starting transfer of ${tableMap.size} tables...\n`);

    // Transfer data for each mapped table within a transaction
    await gamesDb.transaction(async (trx) => {
      console.log('🔒 Starting transaction for data transfer...\n');

      for (const [oldTableName, newTableName] of tableMap) {
        try {
          console.log(`📦 Transferring ${oldTableName} to ${newTableName}...`);

          // Get all data from old table
          const data = await settingsDb(oldTableName).select('*');

          if (data.length === 0) {
            console.log(`   📭 No data to transfer for ${oldTableName}`);
            continue;
          }

          // Check if new table already has data
          const existingData = await trx(newTableName).select('*').limit(1);

          if (existingData.length > 0) {
            console.log(`   ⚠️  ${newTableName} already contains data. Skipping to avoid duplicates.`);
            continue;
          }

          // Insert data in batches to handle large datasets
          const batchSize = 1000;
          let totalInserted = 0;

          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await trx(newTableName).insert(batch);
            totalInserted += batch.length;

            if (data.length > batchSize) {
              console.log(`   📊 Inserted ${totalInserted}/${data.length} rows...`);
            }
          }

          console.log(`   ✅ Successfully transferred ${totalInserted} rows to ${newTableName}`);

          // Verify the transfer within the transaction
          const verifyCount = await trx(newTableName).count('* as count').first();
          const originalCount = await settingsDb(oldTableName).count('* as count').first();

          if (verifyCount.count === originalCount.count) {
            console.log(`   ✅ Verification passed: ${verifyCount.count} rows in both tables`);
          } else {
            console.log(`   ❌ Verification failed: ${originalCount.count} original vs ${verifyCount.count} transferred`);
            throw new Error(`Row count mismatch for ${oldTableName}: expected ${originalCount.count}, got ${verifyCount.count}`);
          }

        } catch (error) {
          console.error(`   ❌ Error transferring ${oldTableName}:`, error.message);
          throw error; // This will rollback the entire transaction
        }
      }

      console.log('\n🔒 Transaction completed successfully - all data committed!');
    });

    console.log('\n🎉 Data transfer completed!');

    // Summary
    console.log('\n📊 Transfer Summary:');
    for (const [oldTableName, newTableName] of tableMap) {
      try {
        const count = await gamesDb(newTableName).count('* as count').first();
        console.log(`   ${oldTableName} -> ${newTableName}: ${count.count} rows`);
      } catch (error) {
        console.log(`   ${oldTableName} -> ${newTableName}: Error getting count`);
      }
    }

  } catch (error) {
    console.error('❌ Transfer failed:', error);
    console.error('🔄 All changes have been rolled back - your games database is unchanged.');
    throw error;
  } finally {
    await settingsDb.destroy();
    await gamesDb.destroy();
  }
}

// Verification function to run after transfer
async function verifyTransfer() {
  const settingsDb = knex(settingsDbConfig);
  const gamesDb = knex(gamesDbConfig);

  try {
    console.log('\n🔍 Verifying data transfer...\n');

    const settingsTables = await settingsDb.raw(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    for (const table of settingsTables) {
      const oldTableName = table.name;
      const newTableName = `settings_${oldTableName}`;

      try {
        const oldCount = await settingsDb(oldTableName).count('* as count').first();
        const newCount = await gamesDb(newTableName).count('* as count').first();

        if (oldCount.count === newCount.count) {
          console.log(`✅ ${oldTableName}: ${oldCount.count} rows matched`);
        } else {
          console.log(`❌ ${oldTableName}: ${oldCount.count} original vs ${newCount.count} transferred`);
        }
      } catch (error) {
        console.log(`⚠️  Could not verify ${oldTableName}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await settingsDb.destroy();
    await gamesDb.destroy();
  }
}

// Main execution
async function main() {
  try {
    await transferSettingsData();
    await verifyTransfer();

    console.log('\n🎊 All done!');

  } catch (error) {
    console.error('💥 Process failed:', error);
    process.exit(1);
  }
}

// Run the transfer
if (require.main === module) {
  main();
}
