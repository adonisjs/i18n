'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Ioc = require('adonis-fold').Ioc
const Drivers = require('./Drivers')
const Antl = require('./Antl')
const CE = require('../Exceptions')

/**
 * Makes driver instance from the list of official drivers or
 * extended drivers
 *
 * @param  {String}   driver
 * @param  {Object}   drivers
 * @param  {Object}   extendedDrivers
 * @param  {Function} callback
 *
 * @return {Object}
 */
const _makeDriverInstance = (driver, drivers, extendedDrivers, callback) => {
  const driverInstance = drivers[driver] ? Ioc.make(drivers[driver]) : extendedDrivers[driver]
  if (!driverInstance) {
    callback()
  }
  return driverInstance
}

class AntlManager {

  /**
   * Used by IoC container to extend Antl by
   * adding new named drivers.
   *
   * @param  {String} key
   * @param  {Object} value
   */
  static extend (key, value) {
    this.extendedDrivers = this.extendedDrivers || {}
    this.extendedDrivers[key] = value
  }

  constructor (Config, View) {
    this.Config = Config
    View.global('antl', this)
    this.constructor.extendedDrivers = this.constructor.extendedDrivers || {}
    this.driversPool = {}
    this.activeDriver = this._getAntlInstance(Config.get('app.locales.driver'))
  }

  /**
   * Returns antl instance for the specified driver
   *
   * @param   {String} driver
   *
   * @return  {Object}
   *
   * @throws {RuntimeException} If unable to locale driver
   *
   * @private
   */
  _getAntlInstance (driver) {
    if (!this.driversPool[driver]) {
      const driverInstance = _makeDriverInstance(driver, Drivers, this.constructor.extendedDrivers, () => {
        throw CE.RuntimeException.invalidAntlDriver(driver)
      })
      this.driversPool[driver] = new Antl(this.Config, driverInstance)
    }
    return this.driversPool[driver]
  }

  /**
   * Returns instance of a named driver
   *
   * @param  {String} driver
   *
   * @return {Object}
   */
  driver (driver) {
    return this._getAntlInstance(driver)
  }

}

/**
 * Adding all methods from Antl class to the manager class. It
 * is required for transparently returning the instance of
 * Antl by calling any of its method via AntlManager.
 */
for (let method of Object.getOwnPropertyNames(Antl.prototype)) {
  if (method !== 'constructor') {
    AntlManager.prototype[method] = function () {
      return this.activeDriver[method].apply(this.activeDriver, arguments)
    }
  }
}

module.exports = AntlManager
