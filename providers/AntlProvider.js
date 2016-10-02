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
    const AntlManager = require('../src/Antl/AntlManager')

    this.app.singleton('Adonis/Addons/Antl', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const View = app.use('Adonis/Src/View')
      return new AntlManager(Config, View)
    })

    this.app.bind('Adonis/Commands/Antl:Setup', (app) => {
      const Helpers = app.use('Adonis/Src/Helpers')
      const Setup = require('../commands/Setup')
      return new Setup(Helpers)
    })

    this.app.manager('Adonis/Addons/Antl', AntlManager)

    this.app.bind('Adonis/Addons/AntlFormats', () => {
      return require('../src/Formats')
    })
  }

}

module.exports = AntlProvider
