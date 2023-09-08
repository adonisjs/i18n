/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@adonisjs/core/types'
import type { I18nManager } from '../i18n_manager.js'
import type { MissingTranslationEventPayload } from './main.js'

declare module '@adonisjs/core/types' {
  export interface EventsList {
    'i18n:missing:translation': MissingTranslationEventPayload
  }
  export interface ContainerBindings {
    i18n: I18nManager
  }
}
