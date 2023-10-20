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

import { format } from './relative_time_formatter.js'
import type {
  TimeFormatOptions,
  NumberFormatOptions,
  CurrencyFormatOptions,
} from '../types.js'

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
 * Core formatter to format different values using the I18n API
 */
export class Formatter {
  #locale: string

  /**
   * The local for the formatter
   */
  get locale() {
    return this.#locale
  }

  constructor(locale: string) {
    this.#locale = locale
  }

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
   */
  formatNumber(value: string | number | bigint, options?: NumberFormatOptions) {
    value = typeof value === 'string' ? Number(value) : value
    return formatters.number(this.locale, options).format(value)
  }

  /**
   * Format a numeric value to a currency
   */
  formatCurrency(value: string | number | bigint, options: CurrencyFormatOptions): string {
    const currencyOptions = { style: 'currency' as const, ...options }
    return this.formatNumber(value, currencyOptions)
  }

  /**
   * Format value as a date. The method accepts the following data
   * types.
   *
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing a unix timestamp
   * - String representing an ISO date/time value
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
   * Format value as time. The method accepts the following data
   * types.
   *
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing a unix timestamp
   * - String representing an ISO date/time value
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
   * Format value as relative diff between the current time
   * and the given value.
   *
   * The following data types are allowed
   *
   * - Date instance
   * - Luxon DateTime instance
   * - Number representing the diff value in provided units. If the "unit" is
   *   auto, the number will be considered as a diff in milliseconds
   * - String representing an ISO date/time value
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
   * Format the value to its plural counter part
   */
  formatPlural(value: string | number, options?: Intl.PluralRulesOptions): string {
    return formatters.plural(this.locale, options).select(Number(value))
  }

  /**
   * Format an array of strings to a sentence.
   */
  formatList(list: Iterable<string>, options?: Intl.ListFormatOptions) {
    return formatters.list(this.locale, options).format(list)
  }

  /**
   * Format region, currency, language codes to their display names
   */
  formatDisplayNames(code: string, options: Intl.DisplayNamesOptions) {
    return formatters.displayNames(this.locale, options).of(code)
  }
}
