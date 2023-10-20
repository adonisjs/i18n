/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import formatters from '@poppinss/intl-formatter'
import { Formats, IntlMessageFormat } from 'intl-messageformat'
import type {
  TimeFormatOptions,
  NumberFormatOptions,
  TranslationsFormatterContract,
} from '../types/main.js'

/**
 * Formatters for ICU message. We need the memoized
 * version for performance
 */
const MessageValuesFormatters = {
  getNumberFormat: formatters.number,
  getDateTimeFormat: formatters.date,
  getPluralRules: formatters.plural,
}

/**
 * ICU formatter formats a translation as per the ICU messages
 * syntax.
 */
export class IcuFormatter implements TranslationsFormatterContract {
  /**
   * Custom named formats defined for supported types.
   */
  static customFormats: Partial<Formats> = {}

  /**
   * Formatter syntax name
   */
  readonly name: string = 'icu'

  /**
   * Define a custom format for message
   */
  static addFormatFor(type: 'number', key: string, options: NumberFormatOptions): void
  static addFormatFor(type: 'date', key: string, options: Intl.DateTimeFormatOptions): void
  static addFormatFor(type: 'time', key: string, options: TimeFormatOptions): void
  static addFormatFor(
    type: 'number' | 'date' | 'time',
    key: string,
    options: NumberFormatOptions | Intl.DateTimeFormatOptions | TimeFormatOptions
  ): void {
    switch (type) {
      case 'number':
        this.customFormats.number = this.customFormats.number || {}
        this.customFormats.number[key] = options
        break
      case 'date':
        this.customFormats.date = this.customFormats.date || {}
        this.customFormats.date[key] = options
        break
      case 'time':
        this.customFormats.time = this.customFormats.time || {}
        this.customFormats.time[key] = options
        break
    }
  }

  /**
   * Formats an ICU message string
   */
  format(message: string, locale: string, data?: Record<string, any>): string {
    return new IntlMessageFormat(message, locale, IcuFormatter.customFormats, {
      /**
       * Disabling type-checking here since https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat accepts "exceptZero" as the
       * "signSymbol" but TypeScript bundled definition doesn't have it
       */
      formatters: MessageValuesFormatters as any,
      ignoreTag: true,
    }).format(data || {})
  }
}
