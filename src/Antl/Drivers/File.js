'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const requireAll = require('require-all')
const _ = require('lodash')
const fs = require('co-fs-extra')

class FileDriver {

  /**
   * Runtime dependencies to be injected by the
   * IoC container
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Helpers']
  }

  constructor (Helpers) {
    this.Helpers = Helpers
    this.localesDir = Helpers.resourcesPath('locales')
  }

  /**
   * Loads locales from resources/locales directory.
   *
   * @return {Array}
   */
  * load () {
    return _.cloneDeep(requireAll({
      dirname: this.localesDir,
      filters: /(.*)\.json$/
    }))
  }

  /**
   * Returns file contents and silently swallows non-existing
   * exceptions by returning an empty object.
   *
   * @param   {String} fromPath
   *
   * @return  {Object}
   *
   * @private
   */
  * _getFileContents (fromPath) {
    try {
      return yield fs.readJson(fromPath)
    } catch (e) {
      return {}
    }
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
  * set (locale, group, key, value) {
    const localeFile = this.Helpers.resourcesPath(`locales/${locale}/${group}.json`)
    const fileContents = yield this._getFileContents(localeFile)
    fileContents[key] = value
    yield fs.writeJson(localeFile, fileContents)
    return true
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
  * remove (locale, group, key) {
    const localeFile = this.Helpers.resourcesPath(`locales/${locale}/${group}.json`)
    const fileContents = yield this._getFileContents(localeFile)
    if (fileContents[key]) {
      delete fileContents[key]
    }
    yield fs.writeJson(localeFile, fileContents)
    return true
  }

}

module.exports = FileDriver
