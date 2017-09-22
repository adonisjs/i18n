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
const _ = require('lodash')
const debug = require('debug')('adonis:antl')

const AntlManager = require('./AntlManager')
const Antl = require('.')

const proxyHandler = {
  get (target, name) {
    if (typeof (name) === 'symbol' || name === 'inspect') {
      return target[name]
    }

    if (typeof (target[name]) !== 'undefined') {
      return target[name]
    }

    const antl = target.loader()
    if (typeof (antl[name]) === 'function') {
      return antl[name].bind(antl)
    }

    return antl[name]
  }
}

/**
 * Antl facade class is binded to the IoC container
 * and works as a facade. This class wires up
 * the loader with the Antl class.
 *
 * @class AntlFacade
 * @binding Adonis/Addons/Antl
 * @alias Antl
 * @singleton true
 */
class AntlFacade {
  constructor (Config) {
    this._config = Config.merge('app.locales', {
      loader: 'file',
      locale: 'en',
      fallbackLocale: 'en'
    })

    /**
     * Memory store to keep all locales
     * for booted drivers
     *
     * @type {Object}
     */
    this._store = {}
    return new Proxy(this, proxyHandler)
  }

  /**
   * Boots the loader and pull messages from
   * it into memory
   *
   * @method bootLoader
   *
   * @param {String} name
   *
   * @return {void}
   */
  async bootLoader (name) {
    debug('booting %s loader', name)
    name = name || this._config.loader
    const messages = await AntlManager.loader(name).load()

    this._store[name] = this._store[name] || {}
    this._store[name] = messages
  }

  /**
   * Returns the instance for a selected
   * or default loader
   *
   * @method loader
   *
   * @param  {String} name
   *
   * @return {Antl}
   */
  loader (name) {
    name = name || this._config.loader
    if (!_.has(this._store, name)) {
      throw GE
        .RuntimeException
        .invoke(`Cannot use loader, since it's not booted. Make sure to call Antl.bootLoader('${name}') first`)
    }

    return new Antl(this._config.locale, this._store[name])
  }
}

module.exports = AntlFacade
