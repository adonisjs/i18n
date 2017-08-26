'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * Nodejs intl API is incomplete, so we
 * need the polyfill
 */
global.Intl = require('intl')

const cacheFn = require('intl-format-cache')
const numberFormatter = cacheFn(Intl.NumberFormat)
const dateFormatter = cacheFn(Intl.DateTimeFormat)
const relativeFormatter = cacheFn(require('intl-relativeformat'))

class Formatter {
  constructor (locale, options) {
    this._locale = locale || 'en-us'
    this._options = options
  }

  /**
   * Formats a number using Intl.NumberFormat. Visit
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat to
   * learn more about configuration options.
   *
   * @method formatNumber
   *
   * @param  {Number}     value
   * @param  {Object}     [options]
   * @param  {String}     [fallback] Fallback text when actual value is missing
   *
   * @return {String}
   *
   * @example
   * ```js
   * formatter
   *   .formatNumber(1000, { style: 'currency', currency: 'usd' })
   * ```
   */
  formatNumber (value, options, fallback) {
    if (!value) {
      return fallback || null
    }
    const formattingOptions = Object.assign({}, this._options, options)
    return numberFormatter(this._locale, formattingOptions).format(value)
  }

  /**
   * Formats the date as per Intl.DateTimeFormat. Learn more about it
   * at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   *
   * @method formatDate
   *
   * @param  {String|Date|Number}   value
   * @param  {Object}               options
   * @param  {String}               fallback
   *
   * @return {String}
   *
   * @example
   * ```js
   * formatter
   *   .formatDate(new Date())
   * ```
   */
  formatDate (value, options, fallback) {
    if (!value) {
      return fallback || null
    }
    const formattingOptions = Object.assign({}, this._options, options)
    return dateFormatter(this._locale, formattingOptions).format(value)
  }

  /**
   * Formats the date relative from the current timestamp. It is
   * based on https://github.com/yahoo/intl-relativeformat.
   *
   * @method formatRelative
   *
   * @param  {Date|String|Number}       value
   * @param  {Object}                   [options]
   * @param  {String}                   [fallback]
   *
   * @return {String}
   */
  formatRelative (value, options, fallback) {
    if (!value) {
      return fallback || null
    }
    const formattingOptions = Object.assign({}, this._options, options)
    return relativeFormatter(this._locale, formattingOptions).format(value)
  }
}

module.exports = Formatter
