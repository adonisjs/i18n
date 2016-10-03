'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const preferredLanguages = require('negotiator/lib/language').preferredLanguages
const CatLog = require('cat-log')
const logger = new CatLog('adonis:antl')

class AntlMiddleware {

  constructor (Config, Antl) {
    this.defaultDriver = Config.get('app.locales.driver')
    this.defaultLocale = Config.get('app.locales.locale')
    this.Antl = Antl
  }

  /**
   * Negotiates the locale via query string.
   *
   * @param   {String} definedLocale
   * @param   {Array} allowedLocales
   *
   * @return  {String|false}
   *
   * @private
   */
  _getViaQueryString (definedLocales, allowedLocales) {
    if (typeof (definedLocales) === 'string' && definedLocales.length) {
      const detectedLocale = preferredLanguages(definedLocales, allowedLocales)
      return detectedLocale instanceof Array ? detectedLocale[0] : detectedLocale
    }
    return null
  }

  /**
   * Normalizes the locale output by returning the default locale
   * when locale is detected as * or falsy
   *
   * @param   {String} locale
   *
   * @return  {String}
   *
   * @private
   */
  _normalizeLocale (locale) {
    return (!locale || locale === '*') ? this.defaultLocale : locale
  }

  /**
   * Switching the antl locale to the current locale negotiated by the
   * end-user. It defaults to the default locale when http request
   * locale does not matches the list of available locales.
   *
   * @param  {Object}   request
   * @param  {Object}   response
   * @param  {Function} next
   * @param  {String}   [driver]
   */
  * handle (request, response, next, driver) {
    driver = driver || this.defaultDriver
    const driverInstance = this.Antl.driver(driver)
    yield driverInstance.load()
    const allowedLocales = driverInstance.locales()

    const requestLanguage = this._getViaQueryString(request.input('lang'), allowedLocales) || request.language(allowedLocales)
    logger.verbose('switching language to %s', requestLanguage)
    this.Antl.setLocale(this._normalizeLocale(requestLanguage))
    yield next
  }

}

module.exports = AntlMiddleware
