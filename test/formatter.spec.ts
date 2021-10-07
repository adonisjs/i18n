/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { DateTime } from 'luxon'
import { Formatter } from '../src/Formatters/Core'

test.group('Formatter', () => {
  test('format a number', (assert) => {
    const formatter = new Formatter('en-in')
    assert.equal(
      formatter.formatNumber('10', { style: 'unit', unit: 'liter', unitDisplay: 'long' }),
      '10 litres'
    )
  })

  test('format currency', (assert) => {
    const formatter = new Formatter('en-in')
    assert.equal(
      formatter.formatCurrency('10', { currency: 'INR', currencyDisplay: 'name' }),
      '10.00 Indian rupees'
    )
  })

  test('format date', (assert) => {
    const formatter = new Formatter('en-in')

    /**
     * Luxon date
     */
    const luxonDate = DateTime.local()
    assert.equal(formatter.formatDate(luxonDate), luxonDate.toFormat('d/MM/yyyy'))

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
      `${jsDate.getDate()}/${jsDate.getMonth() + 1}/${jsDate.getFullYear()}`
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

  test('format time', (assert) => {
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
  })

  test('format a time diff relatively', (assert) => {
    const formatter = new Formatter('en-in')

    assert.equal(formatter.formatRelativeTime(100, 'hours'), 'in 100 hours')
    assert.equal(formatter.formatRelativeTime(1000 * 100 * 3600, 'auto'), 'in 4 days')
    assert.equal(formatter.formatRelativeTime(1000 * 3 * 3600, 'auto'), 'in 3 hours')

    assert.equal(formatter.formatRelativeTime(-100, 'hours'), '100 hours ago')
    assert.equal(formatter.formatRelativeTime(-(1000 * 3 * 3600), 'auto'), '3 hours ago')
  })

  test('format a value to its plural form', (assert) => {
    const formatter = new Formatter('en-in')
    assert.equal(formatter.formatPlural(3, { type: 'ordinal' }), 'few')
  })
})
