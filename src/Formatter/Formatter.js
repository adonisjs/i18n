'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

global.Intl = require('intl')
const fnCache = require('intl-format-cache')
const _ = require('lodash')
const Message = require('./Message')
const Formats = require('./Formats')
const intlNumber = fnCache(Intl.NumberFormat)
const intlDate = fnCache(Intl.DateTimeFormat)
const intlMessage = fnCache(require('intl-messageformat'))
const intlRelativeFormat = fnCache(require('intl-relativeformat'))

/**
 * Build options by merging defaults, format
 * defaults, runtime options and extras.
 *
 * @param   {Object} options
 * @param   {Object} extras
 *
 * @return  {Object}
 *
 * @private
 */
const _buildOptions = function (options, extras) {
  if (_.get(options, 'format')) {
    return _.merge(Formats.getFormat(options.format), options, extras)
  }
  return _.merge(options, extras)
}

const Formatter = exports = module.exports = {}

/**
 * Formats a number using Intl.NumberFormat
 *
 * @param  {String} value
 * @param  {Array}  locales
 * @param  {Object} [options]
 *
 * @return {String}
 */
Formatter.formatNumber = function (value, locales, options) {
  return intlNumber(locales, _buildOptions(options)).format(value)
}

/**
 * Formats a currency value. It is same as formatNumber
 * but more explicit for currency only.
 *
 * @param  {String} value
 * @param  {Array}  locales
 * @param  {String} currency
 * @param  {Object} [options]
 *
 * @return {String}
 */
Formatter.formatAmount = function (value, locales, currency, options) {
  return this.formatNumber(value, locales, _buildOptions(options, {style: 'currency', currency}))
}

/**
 * Formats date using Intl.DateTimeFormat
 *
 * @param  {String} value
 * @param  {Array}  locales
 * @param  {Object} [options]
 *
 * @return {String}
 */
Formatter.formatDate = function (value, locales, options) {
  return intlDate(locales, _buildOptions(options)).format(value)
}

/**
 * Formats a message string for the current
 * locale to the final output.
 *
 * @param  {String}   message
 * @param  {Array}    locales
 * @param  {Object}   values
 * @param  {Function} callback
 *
 * @return {String}
 */
Formatter.formatMessage = function (message, locales, values, callback) {
  let options = {}
  if (typeof (callback) === 'function') {
    const message = new Message()
    callback(message)
    options = message.buildOptions()
  }
  return intlMessage(message, locales, options).format(values)
}

/**
 * Formats date using relative formatter
 *
 * @param  {String} value
 * @param  {Array}  locales
 * @param  {Object} [options]
 *
 * @return {String}
 */
Formatter.formatRelative = function (value, locales, options) {
  return intlRelativeFormat(locales, _buildOptions(options)).format(value)
}
