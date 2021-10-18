/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ViewContract } from '@ioc:Adonis/Core/View'
import { I18nManagerContract } from '@ioc:Adonis/Addons/I18n'

/**
 * Registers the "t" helper and the i18n instance for the default
 * locale.
 *
 * HTTP requests can share the request specific i18n with the template
 * to overwrite the default one
 */
export function viewBindings(View: ViewContract, I18n: I18nManagerContract) {
  /**
   * The "i18n" is a reference to the default locale instance.
   */
  View.global('i18n', I18n.locale(I18n.defaultLocale))

  /**
   * The "t" helper to translate messages within the template
   */
  View.global('t', function (...args: any[]) {
    return this.i18n.formatMessage(...args)
  })

  /**
   * Returns default locale
   */
  View.global('getDefaultLocale', function () {
    return I18n.defaultLocale
  })

  /**
   * Returns supported locales array
   */
  View.global('getSupportedLocales', function () {
    return I18n.supportedLocales
  })
}
