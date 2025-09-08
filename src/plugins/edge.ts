/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { PluginFn } from 'edge.js/types'

import debug from '../debug.ts'
import type { I18n } from '../i18n.ts'
import type { I18nManager } from '../i18n_manager.ts'

/**
 * Edge template engine plugin for AdonisJS I18n integration.
 * Adds global helpers and functions for accessing translations in templates.
 *
 * Provides the following global helpers:
 * - `i18n`: Default I18n instance for the default locale
 * - `t()`: Translation function that uses the current I18n context
 * - `getDefaultLocale()`: Returns the default locale string
 * - `getSupportedLocales()`: Returns array of supported locales
 *
 * @param i18n - The I18nManager instance to integrate with Edge
 * @returns Edge plugin function
 *
 * @example
 * ```typescript
 * // In Edge template:
 * {{ t('hello.world', { name: 'John' }) }}
 * {{ getDefaultLocale() }}
 * {{ getSupportedLocales() }}
 * ```
 */
export const edgePluginI18n: (i18n: I18nManager) => PluginFn<undefined> = (i18n) => {
  debug('registering edge helpers')

  return (edge) => {
    /**
     * Reference to i18n for the default locale. HTTP requests
     * can share request specific instance with templates.
     */
    edge.global('i18n', i18n.locale(i18n.defaultLocale))

    /**
     * "t" global helper
     */
    edge.global(
      't',
      function (
        this: { i18n: I18n },
        identifier: string,
        data?: Record<string, any>,
        fallbackMessage?: string
      ) {
        return this.i18n.t(identifier, data, fallbackMessage)
      }
    )

    /**
     * Reference to the default locale
     */
    edge.global('getDefaultLocale', function () {
      return i18n.defaultLocale
    })

    /**
     * Reference to the list of supported locales
     */
    edge.global('getSupportedLocales', function () {
      return i18n.supportedLocales()
    })
  }
}
