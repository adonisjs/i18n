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
const { ioc } = require('@adonisjs/fold')
const debug = require('debug')('adonis:antl')

const Loaders = require('../Loaders')

/**
 * Antl manager class is used to manage and
 * get instance of loaders.
 *
 * @class AntlManager
 */
class AntlManager {
  constructor () {
    this._extendedLoaders = {}
  }

  /**
   * Add new custom loaders. This method is called via
   * `Ioc.extend` method
   *
   * @method extend
   *
   * @param  {String} key
   * @param  {Class} implementation
   *
   * @return {void}
   */
  extend (key, implementation) {
    debug('adding new loader: %s', key)
    this._extendedLoaders[key] = implementation
  }

  /**
   * Returns the instance of a loader
   *
   * @method loader
   *
   * @param  {String} name
   * @param  {Object} config
   *
   * @return {Loader}
   */
  loader (name, config) {
    if (!name) {
      throw GE.InvalidArgumentException.invalidParameter('Cannot get loader instance without a name')
    }

    name = name.toLowerCase()
    const Loader = Loaders[name] || this._extendedLoaders[name]

    /**
     * Throw exception when loader is not defined
     */
    if (!Loader) {
      throw GE.InvalidArgumentException.invalidParameter(`${name} is not a valid antl loader`)
    }

    debug('instantiating %s loader', name)
    const loaderInstance = ioc.make(Loader)
    loaderInstance.setConfig(config)
    return loaderInstance
  }
}

module.exports = new AntlManager()
