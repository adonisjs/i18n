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
const debug = require('debug')('adonis:antl')

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
    this._messages = messages

    debug('instantiated antl for %s locale', locale)
    this.switchLocale(locale)
  }

  /**
   * Switch to a different locale at runtime
   *
   * @method switchLocale
   *
   * @param {String} locale
   *
   * @return {void}
   */
  switchLocale (locale) {
    this._locale = locale
    this._formatter = new Formatter(locale)
    debug('switching locale to %s', locale)
  }

  /**
   * Same as @ref('Antl.switchLocale') but instead
   * returns the reference to `this` for chaining
   *
   * @method forLocale
   *
   * @param {any} locale
   *
   * @chainable
   */
  forLocale (locale) {
    this.switchLocale(locale)
    return this
  }

  /**
   * Returns the current locale
   *
   * @method currentLocale
   *
   * @return {String} locale
   */
  currentLocale () {
    return this._locale
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
   * @see('Formatter.formatMessage')
   *
   * @throws {InvalidArgumentException} If translation is not found
   */
  formatMessage (key, ...args) {
    const rawMessage = this.get(key)

    if (!rawMessage) {
      throw GE
        .InvalidArgumentException
        .invalidParameter(`Missing ${this._locale} translation for key '${key}'`)
    }

    return this._formatter.formatMessage(rawMessage, ...args)
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

    /**
     * Look for the message inside the locale message
     * and under a certain group.
     *
     * @type {Array}
     */
    const localeNode = [this._locale, group, ...parts]

    /**
     * The fallback node is used when value has not been found
     * inside the local node
     *
     * @type {Array}
     */
    const fallbackKey = this._messages['*'] ? '*' : 'fallback'
    const fallbackNode = [fallbackKey, group, ...parts]

    debug('getting message for %s key from store', localeNode.join('.'))
    debug('using fallback key as %s', fallbackNode.join('.'))

    return _.get(this._messages, localeNode, _.get(this._messages, fallbackNode, defaultValue))
  }

  /**
   * Returns an array of locales available. This
   * list is based of the messages defined.
   *
   * @method availableLocales
   *
   * @return {Array}
   */
  availableLocales () {
    return _.pullAllWith(_.keys(this._messages), ['*', 'fallback'], _.isEqual)
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
