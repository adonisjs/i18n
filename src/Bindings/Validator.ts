/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { validator } from '@ioc:Adonis/Core/Validator'
import { I18nManagerContract } from '@ioc:Adonis/Addons/I18n'

/**
 * Registers a hook to deliver default messages to the validator.
 */
export function validatorBindings(Validator: typeof validator, I18n: I18nManagerContract) {
  Validator.messages((ctx) => {
    if (ctx && 'i18n' in ctx === true) {
      return ctx.i18n.validatorMessages()
    }

    return I18n.locale(I18n.defaultLocale).validatorMessages()
  })
}
