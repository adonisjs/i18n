'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

/**
 * Database loader, pulls the messages from the database
 *
 * @class DatabaseLoader
 * @constructor
 *
 * @param {Database} Database
 */
class DatabaseLoader {
  constructor (Database) {
    this.Database = Database
  }

  /* istanbul ignore next */
  /**
   * Ioc Container injections
   *
   * @method inject
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Database']
  }

  /**
   * Implemented since it's a required method for
   * a loader.
   *
   * @method setConfig
   */
  setConfig () {
  }

  /**
   * Loads locales from the `locales` table and returns
   * it back as a nested object, as required by antl.
   *
   * @method load
   *
   * @return {Object}
   */
  async load () {
    const locales = await this.Database.table('locales')
    return _.transform(locales, (result, row) => {
      result[row.locale] = result[row.locale] || {}
      result[row.locale][row.group] = result[row.locale][row.group] || {}
      _.assign(result[row.locale][row.group], { [row.item]: row.text })
      return result
    }, {})
  }

  /**
   * @alias load
   */
  reload () {
    return this.load()
  }
}

module.exports = DatabaseLoader
