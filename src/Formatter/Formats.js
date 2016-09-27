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
let registeredFormats = {}
const Formats = exports = module.exports = {}

/**
 * Clears all the registered formats
 */
Formats.clear = function () {
  registeredFormats = {}
}

/**
 * Adds a new format to the formats list
 *
 * @param {String} name
 * @param {Object} value
 */
Formats.addFormat = function (name, value) {
  registeredFormats[name] = value
}

/**
 * Returns list of all the formats
 *
 * @return {Object}
 */
Formats.getFormats = function () {
  return registeredFormats
}

/**
 * Returns a format with name
 *
 * @param  {String} name
 *
 * @return {Object}
 */
Formats.getFormat = function (name) {
  return Formats.getFormats()[name]
}

/**
 * Returns a boolean indicating whether a format has
 * been registered or not.
 *
 * @param  {String}  name
 *
 * @return {Boolean}      [description]
 */
Formats.hasFormat = function (name) {
  return !!Formats.getFormat(name)
}

/**
 * Returns a serialized format to be passed to
 * Intl.MessageFormat
 *
 * @param  {String} name
 * @param  {Object} [values]
 *
 * @return {Object}
 */
Formats.serializeFormat = function (name, values) {
  return _.merge(this.getFormat(name), values)
}
