'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Formats = require('../Formats')
const currencyFormats = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'CAD', 'JPY', 'NZD', 'AUD', 'CNY']

Formats.addFormat('curr', { style: 'currency' })

Formats.addFormat('ddmmyy', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric'
})

Formats.addFormat('hhmmss', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
})

currencyFormats.forEach((curr) => {
  Formats.addFormat(curr.toLowerCase(), {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})
