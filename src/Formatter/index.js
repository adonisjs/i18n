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
const GE = require('@adonisjs/generic-exceptions')
const _ = require('lodash')

const numberFormatter = cacheFn(Intl.NumberFormat)
const dateFormatter = cacheFn(Intl.DateTimeFormat)
const relativeFormatter = cacheFn(require('intl-relativeformat'))
const messageFormatter = cacheFn(require('intl-messageformat'))

class Formatter {
  constructor (locale) {
    this._locale = locale || 'en-us'
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
    if (!value && value !== 0) {
      return fallback || null
    }
    const formattingOptions = Object.assign({}, options)
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
    const formattingOptions = Object.assign({}, options)
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
    const formattingOptions = Object.assign({}, options)
    return relativeFormatter(this._locale, formattingOptions).format(value)
  }

  /**
   * Formats the number as a currency
   *
   * @method formatAmount
   *
   * @param  {Number}     value
   * @param  {String}     currency
   * @param  {Object}     [options]
   * @param  {String}     [fallback]
   *
   * @return {String}
   *
   * @throws {InvalidArgumentException} If currency is missing
   */
  formatAmount (value, currency, options, fallback) {
    if (!currency) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('formatAmount expects a valid currency code as 2nd parameter')
    }

    return this.formatNumber(value, Object.assign({}, options, { currency, style: 'currency' }), fallback)
  }

  /**
   * Formats a message using ICU messaging
   * syntax
   *
   * @method formatMessage
   *
   * @param  {String}            message
   * @param  {Object}            values
   * @param  {Object|Array}      [formats]
   *
   * @return {String}
   *
   * @example
   * ```js
   * formatter
   *   .formatMessage('Hello { username }', { username: 'virk' })
   * ```
   *
   * @example
   * ```js
   * formatter
   *   .formatMessage('Total { total, number, usd }', { total: 20 }, [formats.pass('usd', 'number')])
   * ```
   */
  formatMessage (message, values, formats) {
    let parsedFormats = formats

    /**
     * If formats is an array, we assume that it will be an
     * array of results from `Formats.pass` method and
     * parse them accordingly
     */
    if (Array.isArray(formats)) {
      parsedFormats = _.transform(formats, (result, format) => {
        const key = _.findKey(format)

        /**
         * Define result[key] to an empty object if not
         * already defined
         */
        if (!result[key]) {
          result[key] = {}
        }

        _.assign(result[key], format[key])
        return result
      }, {})
    }

    return messageFormatter(message, this._locale, parsedFormats).format(values)
  }
}

module.exports = Formatter
