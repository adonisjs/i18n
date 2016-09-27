'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const fs = require('co-fs-extra')
const chai = require('chai')
const AceCommand = require('adonis-ace/src/Command')
const Ioc = require('adonis-fold').Ioc
const assert = chai.assert
require('co-mocha')

const Helpers = {
  resourcesPath: function (toPath) {
    toPath = toPath || ''
    return path.join(__dirname, 'resources1', toPath)
  }
}

describe('Commands:Setup', function () {
  before(function * () {
    Ioc.bind('Adonis/Src/Command', function () {
      return AceCommand
    })
    this.Setup = require('../commands/Setup')
    yield fs.ensureDir(Helpers.resourcesPath())
  })

  after(function * () {
    yield fs.remove(Helpers.resourcesPath())
  })

  it('should be able create the locales directory', function * () {
    const setup = new this.Setup(Helpers)
    yield setup.handle({}, {})
    const hasLocalesDir = yield fs.exists(Helpers.resourcesPath('locales/*'))
    assert.equal(hasLocalesDir, true)
  })

  it('call make migrations command when the driver is set to database', function * () {
    let callArgs = {}
    const existingRun = AceCommand.prototype.run
    AceCommand.prototype.run = function (command, params, options) {
      callArgs = {command, params, options}
    }
    const setup = new this.Setup(Helpers)
    yield setup.handle({}, {driver: 'database'})
    assert.equal(callArgs.command, 'make:migration')
    assert.equal(callArgs.params, 'create_locales_table')
    assert.deepEqual(callArgs.options, { template: path.join(__dirname, '../commands/templates/localesSchema.mustache') })
    AceCommand.prototype.run = existingRun
  })

  it('call should warn when unsupported driver is passed to the setup command', function * () {
    let warnMessage = null
    const existingWarn = AceCommand.prototype.warn
    AceCommand.prototype.warn = function (message) {
      warnMessage = message
    }
    const setup = new this.Setup(Helpers)
    yield setup.handle({}, {driver: 'mongo'})
    assert.equal(warnMessage, 'Driver mongo does not have a setup process')
    AceCommand.prototype.warn = existingWarn
  })
})
