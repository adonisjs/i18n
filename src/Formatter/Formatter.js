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
const haye = require('haye')
const Message = require('./Message')
const Formats = require('./Formats')
const intlNumber = fnCache(Intl.NumberFormat)
const intlDate = fnCache(Intl.DateTimeFormat)
const intlMessage = fnCache(require('intl-messageformat'))
const intlRelativeFormat = fnCache(require('intl-relativeformat'))
const expressionRegex = /\[(.*)\]/

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
 * Parses string expression of the options to an object
 * to be passed to formatMessage method.
 *
 * @param   {Array} expressionsArray
 *
 * @return  {Object}
 *
 * @private
 */
Formatter._parseExpression = function (expressionsArray, message) {
  expressionsArray.forEach((expression) => {
    const tokens = expression.split(expressionRegex)
    const formatAndType = _.first(tokens).split(':')

    /**
     * Throw exception when a proper format is not passed
     * Expression should have format and type seperated
     * with a colon.
     *
     * @example
     * curr:number
     * usd:number
     */
    if (_.size(formatAndType) !== 2) {
      throw new Error('Invalid formatMessage expression')
    }

    const options = _.nth(tokens, 1) ? haye.fromQS(_.nth(tokens, 1)).toJSON() : {}
    message.passFormat(_.first(formatAndType)).to(_.last(formatAndType)).withValues(options)
  })
}

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
Formatter.formatMessage = function (message, locales, values) {
  let options = {}
  const args = _.slice(arguments, 3)

  /**
   * If 4th argument is a function, pass the message instance to
   * the callback and let it build the message.
   */
  if (_.isFunction(_.first(args))) {
    const message = new Message()
    args[0](message)
    options = message.buildOptions()
  }

  /**
   * If 4th is a string, assume it as an expression and pass
   * all following arguments to the parseExpression method
   * and let it build the options.
   */
  if (_.isString(_.first(args))) {
    const message = new Message()
    Formatter._parseExpression(args, message)
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
