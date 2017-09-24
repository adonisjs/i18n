'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const debug = require('debug')('adonis:antl')

module.exports = function (Antl, HttpContext) {
  /**
   * Detecting current request best locale
   */
  HttpContext.getter('locale', function () {
    const availableLocales = Antl.availableLocales()
    const language = this.request.language(availableLocales)

    if (language) {
      debug('setting request locale as %s', language)
    } else {
      debug('no supported locale has been found, switch to %s locale', Antl.defaultLocale())
    }

    return language || Antl.defaultLocale()
  }, true)

  /**
   * Get antl instance for a given request based
   * upon the current locale of the request
   */
  HttpContext.getter('antl', function () {
    const defaultInstance = Antl.loader()
    defaultInstance.switchLocale(this.locale)
    return defaultInstance
  }, true)

  /**
   * If view is attach to http context, then pass
   * the antl to it as well.
   */
  if (HttpContext.view) {
    HttpContext.view.share({ antl: this.antl })
  }
}
