/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { DateTime } from 'luxon'
import { formatters } from '@poppinss/intl-formatter'
import {
  FormatterContract,
  TimeFormatOptions,
  NumberFormatOptions,
  CurrencyFormatOptions,
} from '@ioc:Adonis/Addons/I18n'

import { format } from '../RelativeTime'

/**
 * Core formatter to format different values using the I18n API
 */
export class Formatter implements FormatterContract {
  constructor(public locale: string) {}

  /**
   * Returns the diff between the current time and the user provided date
   *
   * - If the value is a string, we consider it as an ISODateTime string
   * - If value is a number, then we consider it as a diff in the user provided unit.
   */
  private getTimeDiff(
    value: string | number | Date | DateTime,
    unit: Intl.RelativeTimeFormatUnit | 'auto'
  ): number {
    const diffUnit: any = unit === 'auto' ? 'milliseconds' : unit

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
   * Formats a numeric value
   */
  public formatNumber(value: string | number | bigint, options?: NumberFormatOptions) {
    value = typeof value === 'string' ? Number(value) : value
    return formatters.number(this.locale, options).format(value)
  }

  /**
   * Formats a numeric value to a currency display value
   */
  public formatCurrency(value: string | number | bigint, options: CurrencyFormatOptions): string {
    const currencyOptions = { style: 'currency' as const, ...options }
    return this.formatNumber(value, currencyOptions)
  }

  /**
   * Formats date, luxon date, ISO date/time string or a timestamp to
   * a formatted date-time string
   */
  public formatDate(
    value: string | number | Date | DateTime,
    options?: Intl.DateTimeFormatOptions
  ) {
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
   * Formats date, luxon date, ISO date/time string or a timestamp to
   * a formatted time string
   */
  public formatTime(value: string | number | Date | DateTime, options?: TimeFormatOptions) {
    if (!options) {
      options = { timeStyle: 'medium' }
    } else if (!options.hour && !options.minute && !options.second) {
      options = { timeStyle: 'medium', ...options }
    }

    return this.formatDate(value, options)
  }

  /**
   * Format a date, luxon date, ISO date/time string or a diff value
   * to a relative difference string
   */
  public formatRelativeTime(
    value: string | number | Date | DateTime,
    unit: Intl.RelativeTimeFormatUnit | 'auto',
    options?: Intl.RelativeTimeFormatOptions
  ): string {
    const diff = this.getTimeDiff(value, unit)
    const formatter = formatters.relative(this.locale, { ...(options || {}) })

    return unit === 'auto'
      ? format(formatter, diff)
      : formatter.format(typeof value === 'number' ? diff : Math.floor(diff), unit)
  }

  /**
   * Format the value to its plural counter part
   */
  public formatPlural(value: string | number, options?: Intl.PluralRulesOptions): string {
    return formatters.plural(this.locale, options).select(Number(value))
  }
}
