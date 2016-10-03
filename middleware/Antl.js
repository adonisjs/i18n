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
    this.allowedLocales = Config.get('app.locales.allowed')
    this.Antl = Antl
  }

  * handle (request, response, next) {
    const requestLanguage = request.language(this.allowedLocales)
    if (requestLanguage) {
      this.Antl.setLocale(requestLanguage)
    }
    yield next
  }

}

module.exports = AntlMiddleware
