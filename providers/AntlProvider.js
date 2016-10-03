'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider
const co = require('co')

class AntlProvider extends ServiceProvider {

  /**
   * Booting Antl by loading all the locales for the
   * default driver and adding custom formats to
   * the formats store.
   */
  * boot () {
    const self = this
    require('../src/Antl/formats')
    this.app.once('bind:autoload', () => {
      co(function * () {
        const Antl = self.app.use('Adonis/Addons/Antl')
        yield Antl.load()
        self.app.emit('antl:loaded')
      })
    })
  }

  /**
   * Registerting Antl and Formats to be used by the end-user.
   * Also registerting AntlManager for adding new drivers.
   *
   */
  * register () {
    this._bindProvider()
    this._bindMiddleware()
    this._bindCommands()
    this._bindFormats()
  }

  /**
   * Binds the middleware to be used for detecting the user
   * language and setting the locale accordingly.
   *
   * @private
   */
  _bindMiddleware () {
    this.app.bind('Adonis/Middleware/DetectLocale', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const Antl = app.use('Adonis/Addons/Antl')
      const AntlMiddleware = require('../middleware/Antl')
      return new AntlMiddleware(Config, Antl)
    })
  }

  /**
   * Binds Ace commands to the IoC container. End user is
   * required to register the command manually to the
   * commands list.
   *
   * @private
   */
  _bindCommands () {
    this.app.bind('Adonis/Commands/Antl:Setup', (app) => {
      const Helpers = app.use('Adonis/Src/Helpers')
      const Setup = require('../commands/Setup')
      return new Setup(Helpers)
    })
  }

  /**
   * Binds the formats to the IoC container. It can be
   * used to register/get custom formats.
   *
   * @private
   */
  _bindFormats () {
    this.app.bind('Adonis/Addons/AntlFormats', () => {
      return require('../src/Formats')
    })
  }

  /**
   * Binds the actual provider to the IoC container
   *
   * @private
   */
  _bindProvider () {
    const AntlManager = require('../src/Antl/AntlManager')

    this.app.singleton('Adonis/Addons/Antl', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const View = app.use('Adonis/Src/View')
      return new AntlManager(Config, View)
    })

    /**
     * Binds the manager to the IoC container. It is required
     * to allow the end-user to extend the Antl provider
     * by adding new driver.
     */
    this.app.manager('Adonis/Addons/Antl', AntlManager)
  }

}

module.exports = AntlProvider
