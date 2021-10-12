/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { I18nManagerContract } from '@ioc:Adonis/Addons/I18n'
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Shares the i18n with the HTTP context as a getter
 */
export function contextBindings(
  Context: HttpContextConstructorContract,
  I18n: I18nManagerContract
) {
  Context.getter('i18n', () => I18n.locale(I18n.defaultLocale), true)
}
