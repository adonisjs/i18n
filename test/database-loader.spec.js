'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const { database: DatabaseLoader } = require('../src/Loaders')

class FakeDatabase {
  table () {
    return [
      {
        locale: 'en-us',
        group: 'messages',
        item: 'cart.total',
        text: 'Your cart total is {total}'
      },
      {
        locale: 'en-us',
        group: 'messages',
        item: 'greeting',
        text: 'Hello'
      },
      {
        locale: 'fr',
        group: 'messages',
        item: 'cart.total',
        text: 'Le total de votre panier est {total}'
      },
      {
        locale: 'fr',
        group: 'messages',
        item: 'greeting',
        text: 'Bonjour'
      }
    ]
  }
}

test.group('Database loader', () => {
  test('loads locales from database', async (assert) => {
    const loader = new DatabaseLoader(new FakeDatabase())
    loader.setConfig({})
    const messages = await loader.load()
    assert.deepEqual(messages, {
      'en-us': {
        messages: {
          'cart.total': 'Your cart total is {total}',
          greeting: 'Hello'
        }
      },
      fr: {
        messages: {
          'cart.total': 'Le total de votre panier est {total}',
          greeting: 'Bonjour'
        }
      }
    })
  })
})
