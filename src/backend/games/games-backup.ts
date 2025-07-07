/* eslint-disable no-console */
import {promises as fs} from 'fs'
import path from 'path'
import {Knex} from 'knex'


class BackupManager {
  db_path: string

  backup_dir: string

  db_filename: string


  constructor(knex_instance: Knex) {
    // Get the database path from the knex instance
    this.db_path = this.getDatabasePath(knex_instance)

    // Set backup directory to same location as database file
    this.backup_dir = path.dirname(this.db_path)

    // Get the full filename for backup naming
    this.db_filename = path.basename(this.db_path)
  }

  // eslint-disable-next-line class-methods-use-this
  getDatabasePath(knex_instance: Knex) {
    // For SQLite, knex stores the resolved database path
    const { connection } = knex_instance.client.config

    if (typeof connection === 'string') {
      // If connection is a string, it's the database path
      return path.resolve(connection)
    } else if (connection && connection.filename) {
      // If connection is an object with filename property
      return path.resolve(connection.filename)
    } else {
      throw new Error('Unable to determine SQLite database path from knex instance')
    }
  }

  async createBackupOnStartup() {
    try {
      await this.createBackup()
      console.log('SQLite database backup completed successfully')
    } catch (error) {
      console.error('Backup failed:', error)
      throw error
    }
  }

  async createBackup() {
    const bak1Path = path.join(this.backup_dir, `${this.db_filename}.bak`)
    const bak2Path = path.join(this.backup_dir, `${this.db_filename}.bak2`)

    // If .bak exists, move it to .bak2 (overwriting any existing .bak2)
    try {
      await fs.access(bak1Path)
      await fs.copyFile(bak1Path, bak2Path)
      console.log(`Moved existing backup to: ${path.basename(bak2Path)}`)
    } catch (error) {
      // .bak doesn't exist, which is fine for first backup
    }

    // Create new .bak file
    await fs.copyFile(this.db_path, bak1Path)
    console.log(`Backup created: ${path.basename(bak1Path)}`)

    return bak1Path
  }

  async listBackups() {
    const files = []

    const bak1Path = path.join(this.backup_dir, `${this.db_filename}.bak`)
    const bak2Path = path.join(this.backup_dir, `${this.db_filename}.bak2`)

    try {
      await fs.access(bak1Path)
      files.push(`${this.db_filename}.bak`)
    } catch {
      // .bak doesn't exist
    }

    try {
      await fs.access(bak2Path)
      files.push(`${this.db_filename}.bak2`)
    } catch {
      // .bak2 doesn't exist
    }

    return files
  }

  async restoreBackup(backup_type: 'gameslist' | 'settings', backup_version: 'newer' | 'older') {
    // STRETCH: create an option to restore a backup
    const backup_file = `${backup_type}.db3.bak${backup_version === 'newer'? '' : '2'}`
    const backup_path = path.join(this.backup_dir, backup_file)

    // Verify the backup file exists
    try {
      await fs.access(backup_path)
    } catch {
      throw new Error(`Backup file not found: ${backup_file}`)
    }

    // For SQLite, just copy the backup file over the current database
    await fs.copyFile(backup_path, this.db_path)

    console.log(`Backup restored: ${backup_file}`)
  }
}

module.exports = BackupManager
