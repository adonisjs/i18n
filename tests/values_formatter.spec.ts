/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import { Formatter } from '../src/formatters/values_formatter.js'

test.group('Formatter', () => {
  test('format a number', ({ assert }) => {
    const formatter = new Formatter('en-in')
    assert.equal(
      formatter.formatNumber('10', { style: 'unit', unit: 'liter', unitDisplay: 'long' }),
      '10 litres'
    )
    assert.equal(
      formatter.formatNumber(10, { style: 'unit', unit: 'liter', unitDisplay: 'short' }),
      '10 l'
    )
  })

  test('format currency', ({ assert }) => {
    const formatter = new Formatter('en-in')
    assert.equal(
      formatter.formatCurrency('10', { currency: 'INR', currencyDisplay: 'name' }),
      '10.00 Indian rupees'
    )
  })

  test('format date', ({ assert }) => {
    const formatter = new Formatter('en-in')

    /**
     * Luxon date
     */
    const luxonDate = DateTime.local()
    assert.equal(formatter.formatDate(luxonDate), luxonDate.toFormat('d/M/yyyy'))

    /**
     * ISO String
     */
    assert.equal(formatter.formatDate('2021-10-04'), '4/10/2021')

    /**
     * Date instance
     */
    const jsDate = new Date()
    assert.equal(
      formatter.formatDate(jsDate),
      DateTime.fromJSDate(jsDate).toFormat('d/M/yyyy', { locale: 'en-in' })
    )

    /**
     * Timestamp
     */
    const newJsDate = new Date()
    assert.equal(
      formatter.formatDate(newJsDate.getTime()),
      `${newJsDate.getDate()}/${newJsDate.getMonth() + 1}/${newJsDate.getFullYear()}`
    )
  })

  test('format time', ({ assert }) => {
    const formatter = new Formatter('en-in')

    /**
     * Luxon date
     */
    const luxonDate = DateTime.local()
    assert.equal(
      formatter.formatTime(luxonDate),
      luxonDate.toFormat('h:mm:ss a', { locale: 'en-in' })
    )

    /**
     * ISO String
     */
    assert.equal(formatter.formatTime('2021-10-04T10:00:00'), '10:00:00 am')

    /**
     * Date instance
     */
    const jsDate = new Date()
    assert.equal(
      formatter.formatTime(jsDate),
      DateTime.fromJSDate(jsDate).toFormat('h:mm:ss a', { locale: 'en-in' })
    )

    /**
     * Timestamp
     */
    const newJsDate = new Date()
    assert.equal(
      formatter.formatTime(newJsDate.getTime()),
      DateTime.fromJSDate(newJsDate).toFormat('h:mm:ss a', { locale: 'en-in' })
    )

    /**
     * Custom formatting
     */
    const newJsDate1 = new Date()
    assert.equal(
      formatter.formatTime(newJsDate1.getTime(), { timeStyle: 'full' }),
      DateTime.fromJSDate(newJsDate1).toFormat('h:mm:ss a ZZZZZ', { locale: 'en-in' })
    )
  })

  test('format a time diff relatively', ({ assert }) => {
    const formatter = new Formatter('en-in')

    /**
     * Absolute value
     */
    assert.equal(formatter.formatRelativeTime(100, 'hours'), 'in 100 hours')
    assert.equal(formatter.formatRelativeTime(-100, 'hours'), '100 hours ago')

    /**
     * Diff value in milliseconds, since unit is auto
     */
    assert.equal(formatter.formatRelativeTime(1000 * 100 * 3600, 'auto'), 'in 4 days')
    assert.equal(formatter.formatRelativeTime(1000 * 3 * 3600, 'auto'), 'in 3 hours')
    assert.equal(formatter.formatRelativeTime(3600, 'auto'), 'in 3 seconds')
    assert.equal(formatter.formatRelativeTime(3600 * 100, 'auto'), 'in 6 minutes')
    assert.equal(formatter.formatRelativeTime(1000 * 3600 * 24 * 31, 'auto'), 'in 1 month')
    assert.equal(formatter.formatRelativeTime(-(1000 * 3 * 3600), 'auto'), '3 hours ago')

    /**
     * Diff value as a string
     */
    const isoDate = '2021-10-04T10:00:00'
    const isoDiff = Math.ceil(Math.abs(DateTime.fromISO(isoDate).diffNow('years').years))
    assert.equal(formatter.formatRelativeTime(isoDate, 'auto'), `${isoDiff} years ago`)

    const isoMonthsDiff = Math.ceil(Math.abs(DateTime.fromISO(isoDate).diffNow('months').months))
    assert.equal(formatter.formatRelativeTime(isoDate, 'months'), `${isoMonthsDiff} months ago`)

    /**
     * Diff value as a luxon date
     */
    const luxonDate = DateTime.fromISO('2021-10-04T10:00:00')
    const luxonDiff = Math.ceil(Math.abs(luxonDate.diffNow('years').years))
    assert.equal(formatter.formatRelativeTime(luxonDate, 'auto'), `${luxonDiff} years ago`)

    /**
     * Diff value as JS date
     */
    const jsDate = new Date('2021-10-04T10:00:00')
    const jsDiff = Math.ceil(Math.abs(DateTime.fromJSDate(jsDate).diffNow('years').years))
    assert.equal(formatter.formatRelativeTime(jsDate, 'auto'), `${jsDiff} years ago`)
  })

  test('format a value to its plural form', ({ assert }) => {
    const formatter = new Formatter('en-in')
    assert.equal(formatter.formatPlural(3, { type: 'ordinal' }), 'few')
  })

  test('format a list', ({ assert }) => {
    const formatter = new Formatter('en-in')
    assert.equal(
      formatter.formatList(['Me', 'myself', 'I'], { type: 'conjunction' }),
      'Me, myself and I'
    )
  })

  test('format display names', ({ assert }) => {
    const formatter = new Formatter('en-in')
    assert.equal(formatter.formatDisplayNames('INR', { type: 'currency' }), 'Indian Rupee')
    assert.equal(formatter.formatDisplayNames('en-US', { type: 'language' }), 'American English')
  })
})
