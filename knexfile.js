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
  settings: {
    ...sharedConfig,
    connection: {
      filename: './settings/database/settings.db3'
    },
    migrations: {
      directory: './settings/database/migrations'
    },
    seeds: {
      directory: './settings/database/seeds'
    }
  },

  development: {
    ...sharedConfig,
    connection: {
      filename: './data/development/gameslist.db3',
    },
    seeds: {
      directory: './data/development/seeds',
    },
  },

  development_settings: {
    client: 'sqlite3',
    connection: {
      filename: './settings/database/settings.db3'
    },
    seeds: {
      directory: './data/development/seeds_settings'
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done)
      },
    },
    useNullAsDefault: true,
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
