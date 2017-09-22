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
const { Helpers } = require('@adonisjs/sink')
const { file: FileLoader } = require('../src/Loaders')

test.group('File loader', () => {
  test('loads files from the file system', (assert) => {
    const loader = new FileLoader(new Helpers(__dirname))
    loader.setConfig({})
    const messages = loader.load()
    assert.deepEqual(messages, {
      fallback: {
        index: { hello: 'world' }
      }
    })
  })
})
