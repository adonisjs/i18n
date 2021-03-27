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
const fs = require('fs-extra')
const { join } = require('path')
const { Helpers } = require('@adonisjs/sink')
const { file: FileLoader } = require('../src/Loaders')

test.group('File loader', () => {
  test('loads files from the file system', (assert) => {
    const loader = new FileLoader(new Helpers(__dirname))
    loader.setConfig({})
    const messages = loader.load()
    assert.deepEqual(messages, {
      en: {
        foo: {
          bar: {
            baz: {
              hello: 'world'
            }
          }
        }
      },
      fallback: {
        index: { hello: 'world' }
      }
    })
  })

  test('calling reload must re-read the files from disk', async (assert) => {
    const loader = new FileLoader(new Helpers(__dirname))
    loader.setConfig({})
    loader.load()

    await fs.outputFile(join(__dirname, 'resources', 'locales', 'fallback', 'index.json'), JSON.stringify({
      hello: 'universe'
    }))

    const messages = loader.reload()

    assert.deepEqual(messages, {
      en: {
        foo: {
          bar: {
            baz: {
              hello: 'world'
            }
          }
        }
      },
      fallback: {
        index: { hello: 'universe' }
      }
    })

    await fs.outputFile(join(__dirname, 'resources', 'locales', 'fallback', 'index.json'), JSON.stringify({
      hello: 'world'
    }))
  })
})
