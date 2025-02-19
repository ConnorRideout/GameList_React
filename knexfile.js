// Update with your config settings.

const sharedConfig = {
  client: 'sqlite3',
  connection: {
    filename: './data/gameslist.db3',
  },
  migrations: {
    directory: './data/migrations',
  },
  seeds: {
    directory: './data/seeds',
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
      filename: './data/development/gameslist.db3',
    },
    seeds: {
      directory: './data/development/seeds',
    },
  },

  showcasing: {
    ...sharedConfig,
    connection: {
      filename: './data/showcase/gameslist.db3'
    },
    seeds: {
      directory: './data/showcase/seeds',
    },
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
