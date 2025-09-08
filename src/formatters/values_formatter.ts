/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import formatters from '@poppinss/intl-formatter'
import { DateTime, type DurationObjectUnits } from 'luxon'

import { format } from './relative_time_formatter.ts'
import type { TimeFormatOptions, NumberFormatOptions, CurrencyFormatOptions } from '../types.ts'

/**
 * Mapping of "Intl.RelativeTimeFormatUnit" to luxon "DurationObjectUnits"
 */
const DIFF_UNITS: Record<Intl.RelativeTimeFormatUnit, keyof DurationObjectUnits> = {
  year: 'years',
  years: 'years',
  quarter: 'quarters',
  quarters: 'quarters',
  month: 'months',
  months: 'months',
  week: 'weeks',
  weeks: 'weeks',
  day: 'days',
  days: 'days',
  hour: 'hours',
  hours: 'hours',
  minute: 'minutes',
  minutes: 'minutes',
  second: 'seconds',
  seconds: 'seconds',
}

/**
 * Core formatter to format different values using the I18n API.
 * Provides methods for formatting numbers, currencies, dates, times,
 * relative time, plurals, lists, and display names.
 *
 * @example
 * ```typescript
 * const formatter = new Formatter('en')
 * const formatted = formatter.formatNumber(1234.56)
 * console.log(formatted) // "1,234.56"
 * ```
 */
export class Formatter {
  #locale: string

  /**
   * The locale for the formatter
   * Used for all formatting operations
   */
  get locale() {
    return this.#locale
  }

  /**
   * Creates a new Formatter instance
   *
   * @param locale - The locale to use for formatting operations
   */
  constructor(locale: string) {
    this.#locale = locale
  }

  /**
   * Switches the formatter to use a different locale
   *
   * @param locale - The new locale to use for formatting
   *
   * @example
   * ```typescript
   * formatter.switchLocale('fr')
   * console.log(formatter.locale) // 'fr'
   * ```
   */
  switchLocale(locale: string) {
    this.#locale = locale
  }

  /**
   * Returns the diff between the current time and the user provided date
   *
   * - If the value is a string, we consider it as an ISODateTime string
   * - If value is a number, then we consider it as a diff in the user provided unit.
   */
  #getTimeDiff(
    value: string | number | Date | DateTime,
    unit: Intl.RelativeTimeFormatUnit | 'auto'
  ): number {
    const diffUnit = unit === 'auto' ? 'milliseconds' : DIFF_UNITS[unit]

    /**
     * Returns the diff from the ISODateTime string. The diff is calculated
     * in milliseconds when the user provided unit is auto.
     */
    if (typeof value === 'string') {
      return DateTime.fromISO(value).diff(DateTime.local(), diffUnit)[diffUnit]
    }

    /**
     * Returns the diff from the luxon datetime instance. The diff is calculated
     * in milliseconds when the user provided unit is auto.
     */
    if (DateTime.isDateTime(value)) {
      return value.diff(DateTime.local(), diffUnit)[diffUnit]
    }

    /**
     * Returns the diff from the luxon date instance. The diff is calculated
     * in milliseconds when the user provided unit is auto.
     */
    if (value instanceof Date) {
      return DateTime.fromJSDate(value).diff(DateTime.local(), diffUnit)[diffUnit]
    }

    /**
     * Consider user provided value itself as a diff
     */
    return value
  }

  /**
   * Format a numeric value for a given style
   *
   * @param value - The numeric value to format (string, number, or bigint)
   * @param options - Optional formatting options (style, currency, etc.)
   * @returns Formatted number string according to the current locale
   *
   * @example
   * ```typescript
   * formatter.formatNumber(1234.56) // "1,234.56" (for en locale)
   * formatter.formatNumber(1234.56, { style: 'percent' }) // "123,456%"
   * ```
   */
  formatNumber(value: string | number | bigint, options?: NumberFormatOptions) {
    value = typeof value === 'string' ? Number(value) : value
    return formatters.number(this.locale, options).format(value)
  }

  /**
   * Format a numeric value to a currency
   *
   * @param value - The numeric value to format as currency
   * @param options - Currency formatting options including currency code
   * @returns Formatted currency string
   *
   * @example
   * ```typescript
   * formatter.formatCurrency(1234.56, { currency: 'USD' }) // "$1,234.56"
   * formatter.formatCurrency(1000, { currency: 'EUR' }) // "€1,000.00"
   * ```
   */
  formatCurrency(value: string | number | bigint, options: CurrencyFormatOptions): string {
    const currencyOptions = { style: 'currency' as const, ...options }
    return this.formatNumber(value, currencyOptions)
  }

  /**
   * Format value as a date. The method accepts the following data types:
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing a unix timestamp
   * - String representing an ISO date/time value
   *
   * @param value - The date value to format
   * @param options - Optional date formatting options
   * @returns Formatted date string according to the current locale
   *
   * @example
   * ```typescript
   * formatter.formatDate(new Date()) // "12/25/2023" (for en-US locale)
   * formatter.formatDate('2023-12-25T10:00:00Z', { dateStyle: 'full' })
   * // "Monday, December 25, 2023"
   * ```
   */
  formatDate(value: string | number | Date | DateTime, options?: Intl.DateTimeFormatOptions) {
    let normalizedDate: Date | number

    if (typeof value === 'string') {
      normalizedDate = DateTime.fromISO(value).toJSDate()
    } else if (DateTime.isDateTime(value)) {
      normalizedDate = value.toJSDate()
    } else {
      normalizedDate = value
    }

    return formatters.date(this.locale, options).format(normalizedDate)
  }

  /**
   * Format value as time. The method accepts the following data types:
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing a unix timestamp
   * - String representing an ISO date/time value
   *
   * @param value - The time value to format
   * @param options - Optional time formatting options
   * @returns Formatted time string according to the current locale
   *
   * @example
   * ```typescript
   * formatter.formatTime(new Date()) // "10:30:00 AM" (for en locale)
   * formatter.formatTime('2023-12-25T14:30:00Z', { timeStyle: 'short' }) // "2:30 PM"
   * ```
   */
  formatTime(value: string | number | Date | DateTime, options?: TimeFormatOptions) {
    if (!options) {
      options = { timeStyle: 'medium' }
    } else if (!options.hour && !options.minute && !options.second) {
      options = { timeStyle: 'medium', ...options }
    }

    return this.formatDate(value, options)
  }

  /**
   * Format value as relative diff between the current time and the given value.
   * The following data types are allowed:
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing the diff value in provided units. If the "unit" is
   *   auto, the number will be considered as a diff in milliseconds
   * - String representing an ISO date/time value
   *
   * @param value - The date/time value to format relatively
   * @param unit - The unit for relative formatting or 'auto' for automatic unit selection
   * @param options - Optional relative time formatting options
   * @returns Formatted relative time string
   *
   * @example
   * ```typescript
   * formatter.formatRelativeTime(-1, 'day') // "1 day ago"
   * formatter.formatRelativeTime(new Date(Date.now() + 3600000), 'auto') // "in 1 hour"
   * formatter.formatRelativeTime('2023-12-25T10:00:00Z', 'auto') // "2 days ago"
   * ```
   */
  formatRelativeTime(
    value: string | number | Date | DateTime,
    unit: Intl.RelativeTimeFormatUnit | 'auto',
    options?: Intl.RelativeTimeFormatOptions
  ): string {
    const diff = this.#getTimeDiff(value, unit)
    const formatter = formatters.relative(this.locale, { ...(options || {}) })

    return unit === 'auto'
      ? format(formatter, diff)
      : formatter.format(typeof value === 'number' ? diff : Math.floor(diff), unit)
  }

  /**
   * Format the value to its plural counterpart using locale-specific plural rules
   *
   * @param value - The numeric value to determine plural form for
   * @param options - Optional plural rules options
   * @returns Plural category string ("zero", "one", "two", "few", "many", or "other")
   *
   * @example
   * ```typescript
   * formatter.formatPlural(1) // "one"
   * formatter.formatPlural(2) // "other" (for English)
   * formatter.formatPlural(0) // "other" (for English)
   * ```
   */
  formatPlural(value: string | number, options?: Intl.PluralRulesOptions): string {
    return formatters.plural(this.locale, options).select(Number(value))
  }

  /**
   * Format an array of strings to a sentence using locale-appropriate conjunctions
   *
   * @param list - Iterable of strings to format into a list
   * @param options - Optional list formatting options (type, style)
   * @returns Formatted list string
   *
   * @example
   * ```typescript
   * formatter.formatList(['apple', 'banana', 'orange']) // "apple, banana, and orange"
   * formatter.formatList(['red', 'blue'], { type: 'disjunction' }) // "red or blue"
   * ```
   */
  formatList(list: Iterable<string>, options?: Intl.ListFormatOptions) {
    return formatters.list(this.locale, options).format(list)
  }

  /**
   * Format region, currency, language codes to their display names
   *
   * @param code - The code to get display name for (language, region, currency, etc.)
   * @param options - Display names options specifying the type of code
   * @returns Localized display name for the code
   *
   * @example
   * ```typescript
   * formatter.formatDisplayNames('US', { type: 'region' }) // "United States"
   * formatter.formatDisplayNames('USD', { type: 'currency' }) // "US Dollar"
   * formatter.formatDisplayNames('en', { type: 'language' }) // "English"
   * ```
   */
  formatDisplayNames(code: string, options: Intl.DisplayNamesOptions) {
    return formatters.displayNames(this.locale, options).of(code)
  }
}
