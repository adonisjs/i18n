/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import formatters from '@poppinss/intl-formatter'
import { type Formats, IntlMessageFormat } from 'intl-messageformat'
import type {
  TimeFormatOptions,
  NumberFormatOptions,
  TranslationsFormatterContract,
} from '../types.ts'

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
 * ICU formatter that formats translation messages using ICU MessageFormat syntax.
 * Supports placeholders, pluralization, number/date formatting, and conditional messages.
 *
 * ICU MessageFormat examples:
 * - Simple: `Hello {name}!`
 * - Plurals: `{count, plural, one {# item} other {# items}}`
 * - Select: `{gender, select, male {He} female {She} other {They}}`
 *
 * @example
 * ```typescript
 * const formatter = new IcuFormatter()
 * const result = formatter.format('Hello {name}!', 'en', { name: 'John' })
 * console.log(result) // "Hello John!"
 * ```
 */
export class IcuFormatter implements TranslationsFormatterContract {
  /**
   * Custom named formats defined for supported types (number, date, time).
   * These formats can be referenced by name in ICU message strings.
   */
  static customFormats: Partial<Formats> = {}

  /**
   * Formatter syntax identifier
   * Used to identify this formatter type in configuration
   */
  readonly name: string = 'icu'

  /**
   * Define a custom format that can be referenced by name in ICU messages
   *
   * @param type - The format type ('number', 'date', or 'time')
   * @param key - The name to reference this format by in messages
   * @param options - Formatting options specific to the type
   *
   * @example
   * ```typescript
   * IcuFormatter.addFormatFor('number', 'currency', { style: 'currency', currency: 'USD' })
   * IcuFormatter.addFormatFor('date', 'short', { dateStyle: 'short' })
   *
   * // Usage in ICU message: "Price: {price, number, currency}"
   * ```
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
   * Formats an ICU message string with interpolated data
   *
   * @param message - The ICU message format string
   * @param locale - The locale to use for formatting
   * @param data - Optional data object for variable substitution
   * @returns Formatted message string
   *
   * @example
   * ```typescript
   * const formatter = new IcuFormatter()
   *
   * // Simple interpolation
   * formatter.format('Hello {name}!', 'en', { name: 'John' })
   * // Returns: "Hello John!"
   *
   * // Pluralization
   * formatter.format('{count, plural, one {# item} other {# items}}', 'en', { count: 5 })
   * // Returns: "5 items"
   * ```
   */
  format(message: string, locale: string, data?: Record<string, any>): string {
    return new IntlMessageFormat(message, locale, IcuFormatter.customFormats, {
      formatters: MessageValuesFormatters,
      ignoreTag: true,
    }).format(data || {})
  }
}
