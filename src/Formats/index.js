'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const GE = require('@adonisjs/generic-exceptions')
const debug = require('debug')('adonis:antl')

/**
 * Formats is a store to set and get custom
 * formats.
 *
 * @class Formats
 * @constructor
 */
class Formats {
  constructor () {
    this.clear()
  }

  /**
   * Reset registered format
   *
   * @method clear
   *
   * @return {void}
   */
  clear () {
    this._registered = {}
  }

  /**
   * Add a new custom format
   *
   * @method add
   *
   * @param  {String} name
   * @param  {Object} options
   *
   * @example
   * ```js
   * format.add('amount', { style: 'currency' })
   * ```
   *
   * @chainable
   */
  add (name, options) {
    debug('add new format as %s with options %j', name, options)
    this._registered[name] = options
    return this
  }

  /**
   * Get custom format by name
   *
   * @method get
   *
   * @param  {String} name
   *
   * @return {Object}
   */
  get (name) {
    return this._registered[name]
  }

  /**
   * Returns an object which can be passed to `formatMessage`
   * in order to pass custom formats.
   *
   * @method pass
   *
   * @param  {String} format
   * @param  {String} type
   *
   * @return {Object}
   */
  pass (format, type) {
    if (!this.get(format)) {
      throw GE
        .RuntimeException
        .invoke(`Cannot pass ${format} format to ${type}. Make sure to register the format using formats.add()`)
    }

    return {
      [type]: {
        [format]: this.get(format)
      }
    }
  }
}

module.exports = new Formats()
