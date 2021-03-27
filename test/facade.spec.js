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
const { Config, Helpers } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')

const Facade = require('../src/Antl/Facade')
const Formats = require('../src/Formats')
const AntlManager = require('../src/Antl/AntlManager')

test.group('Facade', (group) => {
  group.before(() => {
    ioc.bind('Adonis/Src/Helpers', () => new Helpers(__dirname))
  })

  test('get antl instance with loaded messages from selected loader', async (assert) => {
    const config = new Config()
    const facade = new Facade(config)
    await facade.bootLoader()
    assert.deepEqual(facade.loader()._messages, {
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
        index: {
          hello: 'world'
        }
      }
    })
  })

  test('format message using default loader', async (assert) => {
    const config = new Config()
    const facade = new Facade(config)
    await facade.bootLoader()
    const antl = facade.loader()
    assert.equal(antl.formatMessage('index.hello'), 'world')
  })

  test('throw exception when trying to use a loader without booting it', async (assert) => {
    class Foo {}
    AntlManager.extend('foo', Foo)
    const config = new Config()
    const facade = new Facade(config)
    const antl = () => facade.loader('foo')
    assert.throw(antl, 'E_RUNTIME_ERROR: Cannot use loader, since it\'s not booted. Make sure to call Antl.bootLoader(\'foo\') first')
  })

  test('get formatted messages for a selected locale', async (assert) => {
    class Foo {
      setConfig () {
      }

      load () {
        return {
          'en-us': {
            billing: {
              total: 'Total {total, number, usd}'
            }
          }
        }
      }
    }

    Formats.add('usd', {
      currency: 'usd',
      style: 'currency'
    })

    AntlManager.extend('foo', Foo)
    const config = new Config()
    config.set('app.locales.locale', 'en-us')

    const facade = new Facade(config)
    await facade.bootLoader('foo')
    const antl = facade.loader('foo')

    const message = antl.formatMessage('billing.total', { total: 20 }, Formats.pass('usd', 'number'))
    assert.equal(message, 'Total $20.00')
  })

  test('proxy methods from antl when using default loader', async (assert) => {
    const config = new Config()
    const facade = new Facade(config)
    await facade.bootLoader()
    assert.equal(facade.formatMessage('index.hello'), 'world')
  })
})
