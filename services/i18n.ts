/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import { I18nManager } from '../src/i18n_manager.js'

let i18n: I18nManager

/**
 * Returns a singleton instance of the I18nManager from the
 * container
 */
await app.booted(async () => {
  i18n = await app.container.make('i18n')
})

export { i18n as default }
