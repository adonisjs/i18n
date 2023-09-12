/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'

import { IcuFormatter } from './icu_messages_formatter.js'
import type { I18nConfig, TranslationsFormattersList } from '../types/main.js'

class FormattersList {
  /**
   * List of registered formatter
   */
  list: Partial<TranslationsFormattersList> = {
    icu: () => new IcuFormatter(),
  }

  /**
   * Extend formatter collection and add a custom
   * formatter to it.
   */
  extend<Name extends keyof TranslationsFormattersList>(
    name: Name,
    factoryCallback: TranslationsFormattersList[Name]
  ): this {
    this.list[name] = factoryCallback
    return this
  }

  /**
   * Creates the formatter instance with config
   */
  create<Name extends keyof TranslationsFormattersList>(name: Name, i18nConfig: I18nConfig) {
    const formatterFactory = this.list[name]
    if (!formatterFactory) {
      throw new RuntimeException(
        `Unknown i18n formatter "${String(name)}". Make sure the formatter is registered`
      )
    }

    return formatterFactory(i18nConfig)
  }
}

export default new FormattersList()
