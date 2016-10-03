'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

class AntlMiddleware {

  constructor (Config, Antl) {
    this.defaultDriver = Config.get('app.locales.driver')
    this.defaultLocale = Config.get('app.locales.locale')
    this.Antl = Antl
  }

  * handle (request, response, next, driver) {
    driver = driver || this.defaultDriver
    const driverInstance = this.Antl.driver(driver)
    yield driverInstance.load()
    const allowedLocales = driverInstance.locales()

    const requestLanguage = request.language(allowedLocales) || this.defaultLocale
    this.Antl.setLocale(requestLanguage)
    yield next
  }

}

module.exports = AntlMiddleware
