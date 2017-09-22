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
const debug = require('debug')('adonis:antl')

/**
 * File loader loads the messages from the file-system
 *
 * @class FileLoader
 * @constructor
 */
class FileLoader {
  constructor (Helpers) {
    this.Helpers = Helpers
    this._config = null
  }

  /* istanbul ignore next */
  /**
   * Ioc Container injections
   *
   * @attribute inject
   *
   * @return {Array}
   */
  static get inject () {
    return ['Adonis/Src/Helpers']
  }

  /**
   * Sets the config, called by Antl manager. It is done
   * so that each loader should own it's constructor
   *
   * @method setConfig
   *
   * @param  {Object}  config
   */
  setConfig (config) {
    this._config = Object.assign({
      localesDir: this.Helpers.resourcesPath('locales')
    }, config)
  }

  /* istanbul ignore next */
  /**
   * Reloads the new locales from the file-system. This
   * method is same as `load`. Since loader API
   * needs to implement both methods, for file
   * loader this method is just an alias.
   *
   * @method reload
   *
   * @return {Object}
   */
  reload () {
    return this.load()
  }

  /**
   * Loads all the locales from the file system.
   *
   * @method load
   *
   * @return {Object}
   */
  load () {
    debug('loading strings from file system %s', this._config.localesDir)

    return requireAll({
      dirname: this._config.localesDir,
      filters: /(.*)\.json$/
    })
  }
}

module.exports = FileLoader
