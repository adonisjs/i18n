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
const formats = require('../src/Formats')

test.group('Formats', (group) => {
  group.beforeEach(() => {
    formats.clear()
  })

  test('add custom format', (assert) => {
    formats.add('curr', { style: 'currency' })
    assert.deepEqual(formats._registered, { curr: { style: 'currency' } })
  })

  test('get added format', (assert) => {
    formats.add('curr', { style: 'currency' })
    assert.deepEqual(formats.get('curr'), { style: 'currency' })
  })

  test('build object which can be used to create formats', (assert) => {
    formats.add('usd', { style: 'currency', currency: 'usd' })
    assert.deepEqual(formats.pass('usd', 'number'), {
      number: {
        usd: {
          style: 'currency',
          currency: 'usd'
        }
      }
    })
  })
})
