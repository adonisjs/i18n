'use strict'

/*
 * adonis-mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const Formatter = require('../src/Formatter')
const formats = require('../src/Formats')

const pad = function (val) {
  return val < 10 ? `0${val}` : val
}

test.group('Formatter', () => {
  test('instantiate formatter', (assert) => {
    const formatter = new Formatter('en-us')
    assert.instanceOf(formatter, Formatter)
  })

  test('format number', (assert) => {
    const formatter = new Formatter('en-us')
    assert.equal(formatter.formatNumber(1000), '1,000')
  })

  test('format number as currency', (assert) => {
    const formatter = new Formatter('en-us')
    assert.equal(formatter.formatNumber(1000, { style: 'currency', currency: 'usd' }), '$1,000.00')
  })

  test('do not format for undefined values', (assert) => {
    const formatter = new Formatter('en-us')
    assert.equal(formatter.formatNumber(null, { currency: 'usd' }), null)
  })

  test('return fallback text for undefined value', (assert) => {
    const formatter = new Formatter('en-us')
    assert.equal(formatter.formatNumber(null, { currency: 'usd' }, 'unknown number'), 'unknown number')
  })

  test('format date', (assert) => {
    const formatter = new Formatter('en-us')
    const today = new Date()
    assert.equal(formatter.formatDate(today.getTime()), `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`)
  })

  test('format date for a different locale', (assert) => {
    const formatter = new Formatter('en-gb')
    const today = new Date()
    assert.equal(
      formatter.formatDate(today.getTime()),
      `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`
    )
  })

  test('return null when date is not defined', (assert) => {
    const formatter = new Formatter()
    assert.equal(formatter.formatDate(null, {}), null)
  })

  test('return fallback value when date is not defined', (assert) => {
    const formatter = new Formatter()
    assert.equal(formatter.formatDate(null, {}, 'unknown date'), 'unknown date')
  })

  test('format relative date', (assert) => {
    const formatter = new Formatter()
    assert.equal(formatter.formatRelative(new Date()), 'now')
  })

  test('format relative date in minutes', (assert) => {
    const formatter = new Formatter()
    const date = new Date()
    date.setMinutes(date.getMinutes() - 10)
    assert.equal(formatter.formatRelative(date), '10 minutes ago')
  })

  test('force format to be in seconds always', (assert) => {
    const formatter = new Formatter()
    const date = new Date()
    date.setMinutes(date.getMinutes() - 10)
    assert.equal(formatter.formatRelative(date, { units: 'second' }), '600 seconds ago')
  })

  test('return null when value doesn\'t exists', (assert) => {
    const formatter = new Formatter()
    assert.isNull(formatter.formatRelative(null))
  })

  test('return fallback value when defined', (assert) => {
    const formatter = new Formatter()
    assert.equal(formatter.formatRelative(null, {}, 'unknown date'), 'unknown date')
  })

  test('format amount', (assert) => {
    const formatter = new Formatter()
    assert.equal(formatter.formatAmount('10', 'usd'), '$10.00')
  })

  test('throw exception when currency is missing', (assert) => {
    const formatter = new Formatter()
    const fn = () => formatter.formatAmount('10')
    assert.throw(fn, 'E_INVALID_PARAMETER: formatAmount expects a valid currency code as 2nd parameter')
  })

  test('format plain message', (assert) => {
    const formatter = new Formatter()
    const message = formatter.formatMessage('Hello {name}', { name: 'virk' })
    assert.equal(message, 'Hello virk')
  })

  test('format message with a number', (assert) => {
    const formatter = new Formatter()
    const message = formatter.formatMessage('Total {total, number}', { total: '20' })
    assert.equal(message, 'Total 20')
  })

  test('format message with percentage number', (assert) => {
    const formatter = new Formatter()
    const message = formatter.formatMessage('Due {total, number, percent}', { total: '20' })
    assert.equal(message, 'Due 2,000%')
  })

  test('pass custom format', (assert) => {
    const formatter = new Formatter()
    const message = formatter.formatMessage('Due {total, number, usd}', { total: '20' }, {
      number: { usd: { style: 'currency', currency: 'usd' } }
    })
    assert.equal(message, 'Due $20.00')
  })

  test('pass custom format', (assert) => {
    const formatter = new Formatter()
    const message = formatter.formatMessage('Due {total, number, usd}', { total: '20' }, {
      number: { usd: { style: 'currency', currency: 'usd' } }
    })
    assert.equal(message, 'Due $20.00')
  })

  test('pass registered format', (assert) => {
    formats.add('usd', {
      currency: 'usd',
      style: 'currency'
    })

    const formatter = new Formatter()

    const message = formatter
      .formatMessage('Due {total, number, usd}', { total: '20' }, [formats.pass('usd', 'number')])

    assert.equal(message, 'Due $20.00')
  })

  test('pass multiple registered format', (assert) => {
    formats.add('usd', {
      currency: 'usd',
      style: 'currency'
    })

    formats.add('gbp', {
      currency: 'gbp',
      style: 'currency'
    })

    const formatter = new Formatter()

    const message = formatter
      .formatMessage(
        'Due {total, number, usd} or {gbpTotal, number, gbp}',
        { total: '20', gbpTotal: '16' },
        [formats.pass('usd', 'number'), formats.pass('gbp', 'number')]
      )

    assert.equal(message, 'Due $20.00 or £16.00')
  })
})
