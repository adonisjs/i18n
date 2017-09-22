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
const { ioc } = require('@adonisjs/fold')

const AntlManager = require('../src/Antl/AntlManager')
const { file: FileLoader } = require('../src/Loaders')

test.group('AntlManager', (group) => {
  group.before(() => {
    ioc.bind('Adonis/Src/Helpers', () => new Helpers(__dirname))
  })

  test('get instance of a loader', (assert) => {
    const file = AntlManager.loader('file')
    assert.instanceOf(file, FileLoader)
  })

  test('throw exception when loader doesn\'t exists', (assert) => {
    const fn = () => AntlManager.loader('foo')
    assert.throw(fn, 'E_INVALID_PARAMETER: foo is not a valid antl loader')
  })

  test('throw exception when trying to access loader without defining the name', (assert) => {
    const fn = () => AntlManager.loader()
    assert.throw(fn, 'E_INVALID_PARAMETER: Cannot get loader instance without a name')
  })

  test('add new loaders', (assert) => {
    class Foo {
      setConfig () {
      }
    }

    AntlManager.extend('foo', Foo)
    assert.instanceOf(AntlManager.loader('foo'), Foo)
  })

  test('call setConfig method on loaders', (assert) => {
    assert.plan(1)

    class Foo {
      setConfig () {
        assert.isTrue(true)
      }
    }

    AntlManager.extend('foo', Foo)
    AntlManager.loader('foo')
  })
})
