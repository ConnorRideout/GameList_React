// Update with your config settings.

const sharedConfig = {
  client: 'sqlite3',
  connection: {
    filename: './src/data/gameslist.db3',
  },
  migrations: {
    directory: './src/data/migrations',
  },
  seeds: {
    directory: './src/data/seeds',
  },
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA foreign_keys = ON', done)
    },
  },
  useNullAsDefault: true,
}

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    ...sharedConfig,
    connection: {
      filename: './src/data/private/gameslist.db3',
    },
    migrations: {
      directory: './src/data/private/migrations',
    },
    seeds: {
      directory: './src/data/private/seeds',
    },
  },

  showcasing: {
    ...sharedConfig
  },

  staging: {
    ...sharedConfig
  },

  production: {
    ...sharedConfig
  },
  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user: 'username',
  //     password: 'password',
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations',
  //   },
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user: 'username',
  //     password: 'password',
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations',
  //   },
  // },
}
