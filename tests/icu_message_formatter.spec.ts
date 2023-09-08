/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { IcuFormatter } from '../src/formatters/icu_messages_formatter.js'
import { DateTime } from 'luxon'

test.group('ICU message formatter', () => {
  test('format a string value', ({ assert }) => {
    const formatter = new IcuFormatter()
    assert.equal(
      formatter.format('The price is: {price, number, ::currency/INR}', 'en-in', { price: 145 }),
      'The price is: ₹145.00'
    )
  })

  test('format a string value using a custom format', ({ assert }) => {
    const formatter = new IcuFormatter()
    IcuFormatter.addFormatFor('number', 'litres', {
      style: 'unit',
      unit: 'liter',
      unitDisplay: 'long',
    })
    IcuFormatter.addFormatFor('date', 'customMedium', {
      dateStyle: 'medium',
    })
    IcuFormatter.addFormatFor('time', 'customMedium', {
      timeStyle: 'medium',
    })

    assert.equal(
      formatter.format('Goods will be delivered at {date, time, customMedium}', 'en-in', {
        date: DateTime.fromISO('2023-10-04').toJSDate(),
      }),
      'Goods will be delivered at 12:00:00 am'
    )

    IcuFormatter['customFormats'] = {}
  })
})
