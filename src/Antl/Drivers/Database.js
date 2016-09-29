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

  /**
   * Returning the base select query to be used for querying
   * a single locale message item
   *
   * @param   {String} locale
   * @param   {String} group
   * @param   {String} item
   *
   * @return  {Object}
   *
   * @private
   */
  _getSelectQuery (locale, group, item) {
    return this.Database.from(this.localesTable).where({ locale, group, item })
  }

  /**
   * Create/update a locale string for a given language
   * and group.
   *
   * @param {String} locale
   * @param {String} group
   * @param {String} item
   * @param {String} text
   *
   * @return {Boolean}
   */
  * set (locale, group, item, text) {
    const hasValue = yield this._getSelectQuery(locale, group, item)

    if (_.size(hasValue)) {
      return yield this._getSelectQuery(locale, group, item).update({ text })
    }
    return yield this.Database.insert({ locale, group, item, text }).into(this.localesTable)
  }

  /**
   * Removes a locale item for a given language
   * and group.
   *
   * @param  {String} locale
   * @param  {String} group
   * @param  {String} item
   *
   * @return {Boolean}
   */
  * remove (locale, group, item) {
    return yield this._getSelectQuery(locale, group, item).delete()
  }

}

module.exports = DatabaseDriver
