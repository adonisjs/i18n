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
const Formatter = require('../src/Formatter/Formatter')
const Formats = require('../src/Formatter/Formats')
const Message = require('../src/Formatter/Message')
const assert = chai.assert

describe('Formatter', function () {
  before(function () {
    Formats.clear()
  })

  it('should throw an exception when expression does not define format and type', function () {
    const parsedExp = () => Formatter._parseExpression(['curr'])
    assert.throw(parsedExp, 'Invalid formatMessage expression')
  })

  it('should return a formatted object to be passed to the formatMessage method', function () {
    const message = new Message()
    Formatter._parseExpression(['curr:number'], message)
    assert.deepEqual(message.buildOptions(), {number: {curr: {}}})
  })

  it('should pass all runtime options as options to the format object', function () {
    const message = new Message()
    Formatter._parseExpression(['curr:number[currency=usd]'], message)
    assert.deepEqual(message.buildOptions(), {number: {curr: { currency: 'usd' }}})
  })

  it('should pass multiple runtime options as options to the format object', function () {
    const message = new Message()
    Formatter._parseExpression(['curr:number[currency=usd, style=currency]'], message)
    assert.deepEqual(message.buildOptions(), {number: {curr: { currency: 'usd', style: 'currency' }}})
  })

  it('should pass multiple expressions to the format object', function () {
    const message = new Message()
    Formatter._parseExpression(['curr:number[currency=usd, style=currency]', 'foo:number[style=percentage]'], message)
    assert.deepEqual(message.buildOptions(), {number: {curr: { currency: 'usd', style: 'currency' }, foo: { style: 'percentage' }}})
  })
})
