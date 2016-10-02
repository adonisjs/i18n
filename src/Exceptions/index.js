'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NE = require('node-exceptions')

class RuntimeException extends NE.RuntimeException {
  /**
   * default error code to be used for raising
   * exceptions
   *
   * @return {Number}
   */
  static get defaultErrorCode () {
    return 500
  }

  /**
   * this exception is raised when an uknown
   * session driver is used
   *
   * @param  {String} driver
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidAntlDriver (driver, code) {
    return new this(`Unable to locate ${driver} antl driver`, code || this.defaultErrorCode, 'E_INVALID_ANTL_DRIVER')
  }
}

module.exports = { RuntimeException }
