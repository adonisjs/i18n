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
const GE = require('@adonisjs/generic-exceptions')
const Formatter = require('../Formatter')

/**
 * Antl is public passing API to format values
 * and messages for a given locale
 *
 * @class Antl
 * @constructor
 *
 * @param {String} locale  The local for which values to be formatted
 * @param {Object} messages An object of messages. It should be loaded via a loader.
 */
class Antl {
  constructor (locale, messages) {
    if (!locale) {
      throw GE.InvalidArgumentException.invalidParameter('Cannot instantiate antl without locale')
    }

    this._locale = locale
    this._messages = messages
    this._formatter = new Formatter(this._locale)
  }

  /**
   * @see('Formatter.formatNumber')
   */
  formatNumber (...args) {
    return this._formatter.formatNumber(...args)
  }

  /**
   * @see('Formatter.formatNumber')
   */
  formatDate (...args) {
    return this._formatter.formatDate(...args)
  }

  /**
   * @see('Formatter.formatNumber')
   */
  formatRelative (...args) {
    return this._formatter.formatRelative(...args)
  }

  /**
   * @see('Formatter.formatNumber')
   */
  formatAmount (...args) {
    return this._formatter.formatAmount(...args)
  }

  /**
   * Returns raw message for a given key
   *
   * @method get
   *
   * @param  {String} key
   * @param  {Mixed}  [defaultValue = null]
   *
   * @return {Mixed}
   */
  get (key, defaultValue = null) {
    const [group, ...parts] = key.split('.')
    const messageKey = parts.join('.')

    /**
     * Look for the message inside the locale message
     * and under a certain group.
     *
     * @type {Array}
     */
    const localeNode = [this._locale, group, messageKey]

    /**
     * The fallback node is used when value has not been found
     * inside the local node
     *
     * @type {Array}
     */
    const fallbackNode = ['*', group, messageKey]

    return _.get(this._messages, localeNode, _.get(this._messages, fallbackNode, defaultValue))
  }

  /**
   * Returns a list of strings for the active
   * locale and an optionally selected group.
   *
   * @method list
   *
   * @param  {String} [group]
   *
   * @return {Object}
   */
  list (group) {
    const localeNode = group ? [this._locale, group] : [this._locale]
    return _.get(this._messages, localeNode)
  }

  /**
   * Returns a flat list of strings for the active
   * locale and optionally for a group
   *
   * @method flatList
   *
   * @param  {String} [group]
   *
   * @return {Object}
   */
  flatList (group) {
    return flatten(this.list(group))
  }
}

module.exports = Antl
