'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const requireAll = require('require-all')
const _ = require('lodash')

class FileDriver {

  /**
   * Runtime dependencies to be injected by the
   * IoC container
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Helpers']
  }

  constructor (Helpers) {
    this.localesDir = Helpers.resourcesPath('locales')
  }

  /**
   * Loads locales from resources/locales directory.
   *
   * @return {Array}
   */
  * load () {
    return _.cloneDeep(requireAll({
      dirname: this.localesDir,
      filters: /(.*)\.json$/
    }))
  }
}

module.exports = FileDriver
