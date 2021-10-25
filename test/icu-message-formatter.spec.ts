/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { IcuFormatter } from '../src/Formatters/Message/Icu'

test.group('ICU message formatter', () => {
  test('format a string value', (assert) => {
    const formatter = new IcuFormatter()
    assert.equal(
      formatter.format('The price is: {price, number, ::currency/INR}', 'en-in', { price: 145 }),
      'The price is: ₹145.00'
    )
  })

  test('format a message for validator', (assert) => {
    const data = {
      field: 'name',
      rule: 'MaxLength',
      options: {
        maxLength: 255,
      },
    }
    const formatter = new IcuFormatter()
    assert.equal(
      formatter.format(
        'This value is too long. It should have { maxLength } characters or less.',
        'en-in',
        data
      ),
      'This value is too long. It should have 255 characters or less.'
    )
  })

  test('format a string value using a custom format', (assert) => {
    const formatter = new IcuFormatter()
    IcuFormatter.addFormat('number', 'litres', {
      style: 'unit',
      unit: 'liter',
      unitDisplay: 'long',
    })

    assert.equal(
      formatter.format('The quantity is {quantity, number, litres}', 'en-in', { quantity: 145 }),
      'The quantity is 145 litres'
    )

    IcuFormatter['customFormats'] = {}
  })
})
