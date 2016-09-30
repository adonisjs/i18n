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
const assert = chai.assert
const Formats = require('../src/Formats')

describe('Formats', function () {
  beforeEach(function () {
    Formats.clear()
  })

  it('should be able to add a new format to the formats list', function () {
    Formats.addFormat('curr', { style: 'currency', currency: 'USD' })
    assert.deepEqual(Formats.getFormat('curr'), { style: 'currency', currency: 'USD' })
  })

  it('should be able to clear the formats list', function () {
    Formats.addFormat('curr', { style: 'currency', currency: 'USD' })
    Formats.clear()
    assert.deepEqual(Formats.getFormats(), {})
  })

  it('should return true when a format exists', function () {
    Formats.addFormat('curr', { style: 'currency', currency: 'USD' })
    assert.equal(Formats.hasFormat('curr'), true)
  })

  it('should return false when a format does not exists', function () {
    assert.equal(Formats.hasFormat('curr'), false)
  })

  it('should return format serialized representation', function () {
    Formats.addFormat('curr', { style: 'currency', currency: 'USD' })
    assert.deepEqual(Formats.serializeFormat('curr'), {style: 'currency', currency: 'USD'})
  })

  it('should return merge runtime options with format defined options', function () {
    Formats.addFormat('curr', { style: 'currency', currency: 'USD' })
    assert.deepEqual(Formats.serializeFormat('curr', {currency: 'INR'}), {style: 'currency', currency: 'INR'})
  })
})
