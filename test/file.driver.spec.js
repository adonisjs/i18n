'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const setup = require('./setup')
const assert = chai.assert
const File = require('../src/Antl/Drivers').file
require('co-mocha')

describe('File Driver', function () {
  it('should load all files from the locales directory', function * () {
    const file = new File(setup.Helpers)
    const locales = yield file.load()
    assert.isDefined(locales.en)
    assert.isDefined(locales.en.messages)
    assert.isDefined(locales.en.messages.greeting)
    assert.equal(locales.en.messages.greeting, 'Hello world')
  })
})
