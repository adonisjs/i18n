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

class DatabaseDriver {

  /**
   * Runtime dependencies to be injected by the
   * IoC container
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Database']
  }

  constructor (Database) {
    this.localesTable = 'locales'
    this.Database = Database
  }

  /**
   * Maps a array of rows inside a flat object
   * of key/value pair.
   *
   * @param   {Array} rows
   *
   * @return  {Object}
   *
   * @private
   */
  _mapRowsToHash (rows) {
    return _(rows)
    .groupBy('group')
    .transform((hash, groupedRows, group) => {
      hash[group] = _.transform(groupedRows, (group, row) => {
        group[row.item] = row.text
        return group
      }, {})
      return hash
    }, {}).value()
  }

  /**
   * Loads locales from the database table called
   * defined inside the config file.
   *
   * @return {Object}
   */
  * load () {
    let localeStrings = []

    // Loading locales in chunks to keep the process memory efficient
    yield this.Database.from(this.localesTable).chunk(100, (strings) => {
      localeStrings = localeStrings.concat(strings)
    })

    return _(localeStrings)
    .groupBy('locale')
    .transform((lang, strings, locale) => {
      lang[locale] = this._mapRowsToHash(strings)
      return lang
    }, {})
    .value()
  }
}

module.exports = DatabaseDriver
