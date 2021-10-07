/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Emitter } from '@adonisjs/core/build/standalone'

import { I18n } from '../src/I18n'
import { IcuMessageFormatter } from '../src/Formatters/Message/Icu'

test.group('I18n', () => {
  test('format a message by its identifier', (assert) => {
    const emitter = new Emitter()
    const messageFormatter = new IcuMessageFormatter()

    const messages = {
      greeting: 'The price is {price, number, ::currency/INR}',
    }
    const fallbackMessages = {
      greeting: 'The price is {price, number, ::currency/USD}',
    }

    const i18n = new I18n('en-in', messageFormatter, emitter, messages, fallbackMessages)
    assert.equal(i18n.formatMessage('greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('use fallback messages when actual message is missing', (assert) => {
    const emitter = new Emitter()
    const messageFormatter = new IcuMessageFormatter()

    const messages = {}
    const fallbackMessages = {
      greeting: 'The price is {price, number, ::currency/USD}',
    }

    const i18n = new I18n('en-in', messageFormatter, emitter, messages, fallbackMessages)
    assert.equal(i18n.formatMessage('greeting', { price: 100 }), 'The price is $100.00')
  })

  test('report missing translations via events', (assert, done) => {
    assert.plan(2)

    const emitter = new Emitter()
    emitter.on('i18n:missing:translation', (payload) => {
      assert.deepEqual(payload, {
        locale: 'en-in',
        identifier: 'greeting',
        hasFallback: false,
      })
      done()
    })

    const messageFormatter = new IcuMessageFormatter()

    const messages = {}
    const fallbackMessages = {}

    const i18n = new I18n('en-in', messageFormatter, emitter, messages, fallbackMessages)
    assert.equal(
      i18n.formatMessage('greeting', { price: 100 }),
      'translation missing: en-in, greeting'
    )
  })
})
