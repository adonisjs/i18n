/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Units and the upper bound milliseconds they hold
 */
const UNITS = {
  years: 24 * 60 * 60 * 1000 * 365,
  months: (24 * 60 * 60 * 1000 * 365) / 12,
  days: 24 * 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  minutes: 60 * 1000,
  seconds: 1000,
}

/**
 * Formats relative time to seconds. The "test" method can return true
 * to claim the diff for formatting.
 */
const SECONDS_FORMATTER = {
  test: (diff: number) => diff < UNITS.minutes,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.seconds), 'seconds')
  },
}

/**
 * Formats relative time to minutes. The "test" method can return true
 * to claim the diff for formatting.
 */
const MINUTES_FORMATTER = {
  test: (diff: number) => diff < UNITS.hours,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.minutes), 'minutes')
  },
}

/**
 * Formats relative time to hours. The "test" method can return true
 * to claim the diff for formatting.
 */
const HOURS_FORMATTER = {
  test: (diff: number) => diff < UNITS.days,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.hours), 'hours')
  },
}

/**
 * Formats relative time to days. The "test" method can return true
 * to claim the diff for formatting.
 */
const DAYS_FORMATTER = {
  test: (diff: number) => diff < UNITS.months,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.days), 'days')
  },
}

/**
 * Formats relative time to months. The "test" method can return true
 * to claim the diff for formatting.
 */
const MONTHS_FORMATTER = {
  test: (diff: number) => diff < UNITS.years,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.months), 'months')
  },
}

/**
 * Formats relative time to years. The "test" method can return true
 * to claim the diff for formatting.
 */
const YEARS_FORMATTER = {
  test: (_: number) => true,
  format: (formatter: Intl.RelativeTimeFormat, diff: number) => {
    return formatter.format(Math.floor(diff / UNITS.years), 'years')
  },
}

/**
 * An stack of formatter. Do not change their order, as we invoke
 * them from smallest to the largest unit
 */
const UNITS_FORMATTER = [
  SECONDS_FORMATTER,
  MINUTES_FORMATTER,
  HOURS_FORMATTER,
  DAYS_FORMATTER,
  MONTHS_FORMATTER,
  YEARS_FORMATTER,
]

/**
 * Formats a relative time to a string with automatic unit selection.
 * Selects the most appropriate unit (seconds, minutes, hours, days, months, years)
 * based on the magnitude of the time difference.
 *
 * @param formatter - The Intl.RelativeTimeFormat instance to use for formatting
 * @param diff - The time difference in milliseconds
 * @returns Formatted relative time string (e.g., "2 days ago", "in 3 hours")
 *
 * @example
 * ```typescript
 * const formatter = new Intl.RelativeTimeFormat('en')
 * format(formatter, -86400000) // "1 day ago" (-24 hours in ms)
 * format(formatter, 3600000)   // "in 1 hour" (1 hour in ms)
 * ```
 */
export function format(formatter: Intl.RelativeTimeFormat, diff: number): string {
  const absDiff = Math.abs(diff)
  return UNITS_FORMATTER.find(({ test }) => test(absDiff))!.format(formatter, diff)
}
