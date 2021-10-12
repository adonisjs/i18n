/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Event' {
  import { MissingTranslationEventData } from '@ioc:Adonis/Addons/I18n'
  export interface EventsList {
    'i18n:missing:translation': MissingTranslationEventData
  }
}
