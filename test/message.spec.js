'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Message = require('../src/Formatter/Message')
const Formats = require('../src/Formatter/Formats')
const chai = require('chai')
const assert = chai.assert

describe('Message', function () {
  it('should be able to build a new format message', function () {
    Formats.addFormat('curr', {style: 'currency'})
    const message = new Message()
    message.passFormat('curr')
    assert.deepEqual(message.serializedFormats, [{name: 'curr', type: null, runTimeValues: null}])
  })

  it('should be able to chain type for which format should be pulled', function () {
    Formats.addFormat('curr', {style: 'currency'})
    const message = new Message()
    message.passFormat('curr').to('number')
    assert.deepEqual(message.serializedFormats, [{name: 'curr', type: 'number', runTimeValues: null}])
  })

  it('should be able to set the runtime values', function () {
    Formats.addFormat('curr', {style: 'currency'})
    const message = new Message()
    message.passFormat('curr').to('number').withValues({currency: 'USD'})
    assert.deepEqual(message.serializedFormats, [{name: 'curr', type: 'number', runTimeValues: {currency: 'USD'}}])
  })

  it('should start a new chain as soon as passFormat method is called', function () {
    Formats.addFormat('curr', {style: 'currency'})
    Formats.addFormat('time', {hour: 'numeric', minute: 'numeric'})
    const message = new Message()
    message.passFormat('curr')
    message.passFormat('time').to('time')
    assert.deepEqual(message.serializedFormats, [
      {name: 'curr', type: null, runTimeValues: null},
      {name: 'time', type: 'time', runTimeValues: null}
    ])
  })

  it('should build the options to be passed to Intl.MessageFormat', function () {
    Formats.addFormat('curr', {style: 'currency'})
    Formats.addFormat('per', {style: 'percentage'})
    const message = new Message()
    message.passFormat('curr').to('number').withValues({currency: 'USD'})
    message.passFormat('per').to('number')
    assert.deepEqual(message.buildOptions(), {
      number: {
        curr: {
          style: 'currency',
          currency: 'USD'
        },
        per: {
          style: 'percentage'
        }
      }
    })
  })
})
