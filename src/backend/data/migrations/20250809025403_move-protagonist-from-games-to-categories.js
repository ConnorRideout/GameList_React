/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
  // Check if protagonist is a category
  const hasProtag = await knex('categories')
    .select('category_id')
    .where('category_name', 'protagonist')
    .first()
  // Check if protagonist column exists in games
  const hasProtagCol = await knex.schema.hasColumn('games', 'protagonist')
  if (hasProtag && hasProtagCol) {
    // Insert protagonist relationships into game_category_options
    const dataToInsert = await knex('games as g')
      .join('category_options as co', 'g.protagonist', 'co.option_name')
      .select('g.game_id', 'co.option_id')

    for (let i = 0; i < dataToInsert.length; i += 20) {
      const batch = dataToInsert.slice(i, i + 20)
      await knex('games_category_options')
        .insert(batch);
    }

    console.log("Successfully moved the protagonist to categories. Please manually delete the protagonist column in the 'games' table using SQLiteStudio")
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
  // Check if protagonist is a category
  const hasProtag = await knex('categories')
    .select('category_id')
    .where('category_name', 'protagonist')
    .first()
  // Check if protagonist column exists in games
  const hasProtagCol = await knex.schema.hasColumn('games', 'protagonist')

  if (hasProtag && hasProtagCol) {
    // Get the protagonist data that we need to restore
    const gameProtagonists = await knex('games_category_options as gco')
      .join('category_options as co', 'gco.option_id', 'co.option_id')
      .select('gco.game_id', 'co.option_name as protagonist')
      .where('co.category_id', 5);

    // Restore protagonist data to games table in batches
    for (let i = 0; i < gameProtagonists.length; i += 20) {
      const batch = gameProtagonists.slice(i, i + 20);

      for (const row of batch) {
        await knex('games')
          .where('game_id', row.game_id)
          .update({ protagonist: row.protagonist });
      }
    }

    // Remove the protagonist relationships from games_category_options
    // Get the specific relationships we need to remove
    const relationshipsToRemove = await knex('games_category_options as gco')
      .join('category_options as co', 'gco.option_id', 'co.option_id')
      .select('gco.game_id', 'gco.option_id')
      .where('co.category_id', 5);

    // Delete in batches
    for (let i = 0; i < relationshipsToRemove.length; i += 20) {
      const batch = relationshipsToRemove.slice(i, i + 20);

      for (const row of batch) {
        await knex('games_category_options')
          .where('game_id', row.game_id)
          .where('option_id', row.option_id)
          .del();
      }
    }
  } else if (hasProtag && !hasProtagCol) {
    console.log('In order to rollback the protagonist from categories, you must manually create a "protagonist" column in the "games" table using SQLiteStudio')
  }
};
