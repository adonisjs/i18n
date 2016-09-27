'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider

class AntlProvider extends ServiceProvider {

  /**
   * Booting Antl by loading all the locales for the
   * default driver and adding custom formats to
   * the formats store.
   */
  * boot () {
    const Antl = this.app.use('Adonis/Addons/Antl')
    const Formats = this.app.use('Adonis/Addons/AntlFormats')
    Formats.addFormat('curr', {style: 'currency'})
    yield Antl.load()
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

    this.app.manager('Adonis/Addons/Antl', AntlManager)

    this.app.bind('Adonis/Addons/AntlFormats', () => {
      return require('../src/Formatter/Formats')
    })
  }

}

module.exports = AntlProvider
