'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Formats = require('./Formats')
const _ = require('lodash')

class Message {

  constructor () {
    this.serializedFormats = []
  }

  /**
   * Picks a format to be used for format message
   *
   * @param  {String} name
   *
   * @return {Object}
   */
  passFormat (name) {
    this.serializedFormats.push({name, type: null, runTimeValues: null})
    return this
  }

  /**
   * Set to property on the last serializedFormat.
   *
   * @param  {String} type
   *
   * @return {Object}
   */
  to (type) {
    const lastFormat = _.last(this.serializedFormats)
    lastFormat.type = type
    return this
  }

  /**
   * Sets runtime values on the last serialized format.
   *
   * @param  {Object} values
   *
   * @return {Object}
   */
  withValues (values) {
    const lastFormat = _.last(this.serializedFormats)
    lastFormat.runTimeValues = values
    return this
  }

  /**
   * Serializes an array of formats and returns
   * an object for same
   *
   * @param   {Array} group
   *
   * @return  {Object}
   *
   * @private
   */
  _serializeGroup (group) {
    return _.transform(group, (formatsResult, item) => {
      formatsResult[item.name] = Formats.serializeFormat(item.name, item.runTimeValues)
      return formatsResult
    }, {})
  }

  /**
   * Build options to be passed to Intl.MessageFormat
   *
   * @return {Object}
   */
  buildOptions () {
    return _(this.serializedFormats)
      .groupBy('type')
      .transform((result, formats, type) => {
        result[type] = this._serializeGroup(formats)
        return result
      }, {})
      .value()
  }

}

module.exports = Message
