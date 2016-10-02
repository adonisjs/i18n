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
const flatten = require('flat')
const Formatter = require('../Formatter')
const CatLog = require('cat-log')
const logger = new CatLog('adonis:antl')

class Antl {

  constructor (Config, driver) {
    this._locale = Config.get('app.locales.locale', 'en')
    this._fallbackLocale = Config.get('app.locales.fallbackLocale', 'en')
    this._defaults = {
      localeMatcher: Config.get('app.locales.localeMatcher', 'best fit')
    }
    this._driver = driver
    this._localeStrings = {}
    this._stringsLoaded = false
    this._temporaryLocale = null
  }

  /**
   * Returns runtime locale, if for method is used it
   * will return the temporary locale, otherwise it
   * will return the actual locale.
   *
   * @return  {String}
   *
   * @private
   */
  _getRuntimeLocale () {
    const locale = this._temporaryLocale ? this._temporaryLocale : this.getLocale()
    return locale
  }

  /**
   * Clears the temporary locale by setting it to null
   *
   * @private
   */
  _clearTemporaryLocale () {
    this._temporaryLocale = null
  }

  /**
   * Returns runtime locale and fallback locale as
   * an array
   *
   * @return  {Array}
   *
   * @private
   */
  _getRuntimeLocales () {
    const locales = [this._getRuntimeLocale(), this._fallbackLocale]
    this._clearTemporaryLocale()
    return locales
  }

  /**
   * Returns the value to be formatted for a given string.
   * Returns the actual value if key does not exists.
   *
   * @param   {String} key
   * @param  {String} locale
   *
   * @return  {Mixed}
   *
   * @private
   */
  _getStringValue (key, locale) {
    const tokens = key.split('.')
    const group = _.first(tokens)
    const item = _.tail(tokens).join('.')
    const value = _.get(this._localeStrings, [locale, group, item], key)
    return value === key ? _.get(this._localeStrings, ['*', group, item], key) : value
  }

  /**
   * Loads all locale strings by calling the load
   * method on the active driver. End user is
   * required to call this method manually
   * since it is an async call.
   */
  * load () {
    if (!this._stringsLoaded) {
      const driverName = this._driver.constructor ? this._driver.constructor.name : 'currently active'
      logger.verbose('loading and caching %s driver locales', driverName)
      this._localeStrings = yield this._driver.load()
      this._stringsLoaded = true
    }
  }

  /**
   * Forcefully reloads all locale strings by calling
   * the reloadload method on the active driver.
   * End user is required to call this method
   * manually since it is an async call.
   */
  * reload () {
    this._localeStrings = yield this._driver.load()
  }

  /**
   * Returns a list of locales with atleast single
   * message.
   *
   * @return {Array}
   */
  locales () {
    return _.keys(this._localeStrings)
  }

  /**
   * Returns a list of string for a given or default
   * locale.
   *
   * @param {group} String
   *
   * @return {Object}
   */
  strings (group) {
    const locale = this._getRuntimeLocale()
    this._clearTemporaryLocale()
    return group ? _.get(this._localeStrings, [locale, group], null) : _.get(this._localeStrings, locale, null)
  }

  /**
   * Returns a pair of strings to be used for
   * showing a list of locales with their
   * values.
   *
   * @param {group} String
   *
   * @return {Object}
   */
  pair (group) {
    const strings = this.strings(group)
    return strings ? flatten(strings) : null
  }

  /**
   * Sets the value of a given string for a given
   * locale
   *
   * @param  {String} group
   * @param  {String} key
   * @param  {Mixed} value
   *
   * @return {Boolean}
   */
  * set (group, key, value) {
    const locale = this._getRuntimeLocale()
    this._clearTemporaryLocale()
    const response = yield this._driver.set(locale, group, key, value)
    if (response) {
      return _.set(this._localeStrings, [locale, group, key], value)
    }
    return false
  }

  /**
   * Returns value for a given string
   * for a given locale.
   *
   * @param  {String} key
   *
   * @return {Mixed}
   */
  get (key) {
    const locale = this._getRuntimeLocale()
    this._clearTemporaryLocale()
    return this._getStringValue(key, locale)
  }

  /**
   * Removes value for a locale from the store
   *
   * @param  {String} group
   * @param  {String} key
   *
   * @return {Boolean}
   */
  * remove (group, key) {
    const locale = this._getRuntimeLocale()
    this._clearTemporaryLocale()
    const response = yield this._driver.remove(locale, group, key)
    if (response) {
      return _.set(this._localeStrings, [locale, group, key], undefined)
    }
    return false
  }

  /**
   * Returns the currently active locale
   *
   * @return {String}
   */
  getLocale () {
    return this._locale
  }

  /**
   * Sets locale in rutime
   *
   * @param {String} locale
   */
  setLocale (locale) {
    logger.verbose('switching locale to %s', locale)
    this._locale = locale
  }

  /**
   * Returns a boolean indicating if given locale is
   * the current locale or not.
   *
   * @param  {String}  locale
   *
   * @return {Boolean}        [description]
   */
  isLocale (locale) {
    return this._locale === locale
  }

  /**
   * Chainable method to set a temporary runtime locale
   * for a single translation only.
   *
   * @param  {String} temporaryLocale
   *
   * @return {Object}
   */
  for (temporaryLocale) {
    this._temporaryLocale = temporaryLocale
    return this
  }

  /**
   * Formats a number
   *
   * @param  {String} value
   * @param  {Object} [options]
   *
   * @return {String}
   */
  formatNumber (value, options) {
    return Formatter.formatNumber(value, this._getRuntimeLocales(), _.merge(this._defaults, options))
  }

  /**
   * Formats a number as currency
   *
   * @param  {String} value
   * @param  {Object} [options]
   *
   * @return {String}
   */
  formatAmount (value, currency, options) {
    return Formatter.formatAmount(value, this._getRuntimeLocales(), currency, _.merge(this._defaults, options))
  }

  /**
   * Formats a date
   *
   * @param  {String} value
   * @param  {Object} [options]
   *
   * @return {String}
   */
  formatDate (value, options) {
    return Formatter.formatDate(value, this._getRuntimeLocales(), _.merge(this._defaults, options))
  }

  /**
   * Formats date to a relative unit
   *
   * @param  {String} value
   * @param  {Object} [options]
   *
   * @return {String}
   */
  formatRelative (value, options) {
    return Formatter.formatRelative(value, this._getRuntimeLocales(), _.merge(this._defaults, options))
  }

  /**
   * Formats a message
   *
   * @param  {String} key
   * @param  {Object} values
   * @param  {Object} [options]
   *
   * @return {String}
   */
  formatMessage (key, values, callback) {
    return Formatter.formatMessage(this._getStringValue(key, this._getRuntimeLocale()), this._getRuntimeLocales(), values, callback)
  }

}

module.exports = Antl
