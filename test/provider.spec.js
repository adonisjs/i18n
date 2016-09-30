'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const fold = require('adonis-fold')
const path = require('path')
const chai = require('chai')
const setup = require('./setup')
require('co-mocha')

const Ioc = fold.Ioc
const Registrar = fold.Registrar
const assert = chai.assert

describe('Provider', function () {
  before(function () {
    Ioc.bind('Adonis/Src/Config', function () {
      return setup.Config
    })
    Ioc.bind('Adonis/Src/View', function () {
      return setup.View
    })
    Ioc.bind('Adonis/Src/Helpers', function () {
      return setup.Helpers
    })
  })

  it('should be able to register Antl as a provider', function (done) {
    Registrar
    .register([path.join(__dirname, '../providers/AntlProvider')])
    .then(() => {
      Ioc.once('antl:loaded', function () {
        const Antl = Ioc.use('Adonis/Addons/Antl')
        assert.equal(Antl.activeDriver._stringsLoaded, true)
        done()
      })
      Ioc.autoload('App', 'app')
    }).catch(done)
  })

  it('should be able to register Antl as a manager and be able to extend it', function * () {
    class Mongo {}
    Ioc.extend('Adonis/Addons/Antl', 'mongo', function () {
      return new Mongo()
    })
    yield Registrar.register([path.join(__dirname, '../providers/AntlProvider')])
    const Antl = Ioc.use('Adonis/Addons/Antl')
    const mongo = Antl.driver('mongo')
    assert.equal(mongo._driver.constructor.name, 'Mongo')
  })
})
