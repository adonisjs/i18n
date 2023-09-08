/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { I18nConfig } from './types/main.js'

/**
 * Define i18n config
 */
export function defineConfig(config: Partial<I18nConfig>): I18nConfig {
  return {
    defaultLocale: 'en',
    translationsFormat: 'icu',
    loaders: {},
    ...config,
  }
}
