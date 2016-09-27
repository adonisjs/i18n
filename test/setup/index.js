'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')

const Config = {
  get: function (key) {
    switch (key) {
      case 'app.locales.driver':
        return 'file'
      case 'app.locales.localeMatcher':
        return 'best fit'
      case 'database.connection':
        return 'sqlite'
      case 'database.sqlite':
        return {
          client: 'sqlite3',
          connection: {
            filename: path.join(__dirname, '../database/dev.sqlite3')
          },
          useNullAsDefault: true
        }
      default:
        return 'en'
    }
  }
}

const View = {
  global: function (key, value) {
    this[key] = value
  }
}

const Helpers = {
  resourcesPath: function (toPath) {
    toPath = toPath || ''
    return path.join(__dirname, '../resources', toPath)
  },

  databasePath: function () {
    return path.join(__dirname, '../database')
  }
}

module.exports = { Config, View, Helpers }
