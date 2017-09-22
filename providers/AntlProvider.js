'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class AntlProvider extends ServiceProvider {
  /**
   * Register the facade under `Adonis/Addons/Antl`
   * namespace
   *
   * @method _registerAntlFacade
   *
   * @return {void}
   *
   * @private
   */
  _registerAntlFacade () {
    this.app.singleton('Adonis/Addons/Antl', (app) => {
      const Facade = require('../src/Antl/Facade')
      return new Facade(app.use('Adonis/Src/Config'))
    })
    this.app.alias('Adonis/Addons/Antl', 'Antl')
  }

  /**
   * Register antl manager under `Adonis/Addons/Antl`
   * namespace
   *
   * @method _registerAntlManager
   *
   * @return {void}
   *
   * @private
   */
  _registerAntlManager () {
    this.app.manager('Adonis/Addons/Antl', require('../src/Antl/AntlManager'))
  }

  /**
   * Register bindings
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerAntlFacade()
    this._registerAntlManager()
  }

  /**
   * On boot, boot the default loader
   *
   * @method boot
   *
   * @return {void}
   */
  async boot () {
    const Antl = this.app.use('Adonis/Addons/Antl')
    await Antl.bootLoader()
  }
}

module.exports = AntlProvider
