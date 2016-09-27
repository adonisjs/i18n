'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/* eslint-disable no-new */
const chai = require('chai')
const fs = require('co-fs-extra')
const Ioc = require('adonis-fold').Ioc
const AntlManager = require('../src/Antl/AntlManager')
const setup = require('./setup')
const assert = chai.assert
require('co-mocha')

describe('AntlManager', function () {
  before(function * () {
    Ioc.bind('Adonis/Src/Helpers', function () {
      return setup.Helpers
    })

    Ioc.bind('Adonis/Src/Database', function () {
    })
  })

  it('should be able to initialize', function () {
    const antl = new AntlManager(setup.Config, setup.View)
    assert.equal(antl.constructor.name, 'AntlManager')
  })

  it('should be able to execute methods on antl instance via manager instance', function () {
    const antl = new AntlManager(setup.Config, setup.View)
    assert.isFunction(antl.formatMessage)
  })

  it('should return antl instance with the defined driver', function () {
    const antl = new AntlManager(setup.Config, setup.View)
    const db = antl.driver('database')
    assert.equal(db._driver.constructor.name, 'DatabaseDriver')
    assert.equal(db.driver, undefined)
  })

  it('should throw exception when trying to access an undefined driver', function () {
    const antl = new AntlManager(setup.Config, setup.View)
    try {
      const db = antl.driver('mongo')
      assert.notExist(db)
    } catch (e) {
      assert.equal(e.message, 'E_INVALID_ANTL_DRIVER: Unable to locate mongo antl driver')
    }
  })

  it('should be able to extend AntlManager to add a new driver', function () {
    AntlManager.extend('mongo', class Mongo {})
    const antl = new AntlManager(setup.Config, setup.View)
    const mongo = antl.driver('mongo')
    assert.equal(mongo._driver.name, 'Mongo')
  })

  it('should not create the driver instance when once created', function * () {
    const antl = new AntlManager(setup.Config, setup.View)
    yield antl.load()
    const file = antl.driver('file')
    assert.equal(file._stringsLoaded, true)
  })

  it('should be able to access antl instance inside the view layer', function () {
    new AntlManager(setup.Config, setup.View)
    assert.equal(setup.View.antl.formatNumber('1000', { style: 'currency', currency: 'USD' }), '$1,000.00')
  })

  it('should be able to switch driver inside views', function () {
    new AntlManager(setup.Config, setup.View)
    const file = setup.View.antl.driver('file')
    assert.equal(file._driver.constructor.name, 'FileDriver')
  })
})
