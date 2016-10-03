'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const http = require('http')
const chai = require('chai')
const co = require('co')
const fs = require('co-fs-extra')
const accepts = require('accepts')
const request = require('supertest')
const Ioc = require('adonis-fold').Ioc
const AntlManager = require('../src/Antl/AntlManager')
const AntlMiddleware = require('../middleware/Antl')
const setup = require('./setup')
const assert = chai.assert
require('co-mocha')

describe('Antl Middleware', function () {
  before(function () {
    Ioc.bind('Adonis/Src/Helpers', function () {
      return setup.Helpers
    })
    this.Antl = new AntlManager(setup.Config, setup.View)
  })

  it('should set the locale when accept-language header is defined', function * () {
    const self = this
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return null
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').set('accept-language', 'fr-fr').expect(200)
    assert.equal(response.body.currentLocale, 'fr')
  })

  it('should not set the locale when accept-language header is defined but with unsupported language', function * () {
    const self = this
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return null
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').set('accept-language', 'ca').expect(200)
    assert.equal(response.body.currentLocale, 'en')
  })

  it('should return the nearest locale when lcid string is provided', function * () {
    const self = this
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return null
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').set('accept-language', 'en-uk').expect(200)
    assert.equal(response.body.currentLocale, 'en')
  })

  it('should return the lcid string when there are strings for lcid', function * () {
    const self = this
    yield fs.outputJSON(setup.Helpers.resourcesPath('locales/en-uk/messages.json'), {greeting: 'Hello, Gentleman'})
    yield this.Antl.reload()
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return null
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').set('accept-language', 'en-uk').expect(200)
    assert.equal(response.body.currentLocale, 'en-uk')
    yield fs.remove(setup.Helpers.resourcesPath('locales/en-uk'))
  })

  it('should negotiate the language using the query string', function * () {
    const self = this
    yield this.Antl.reload()
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return 'fr'
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').expect(200)
    assert.equal(response.body.currentLocale, 'fr')
  })

  it('should negotiate the language by defining multiple languages in the query string', function * () {
    const self = this
    yield this.Antl.reload()
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return 'ca,ar,fr'
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').expect(200)
    assert.equal(response.body.currentLocale, 'fr')
  })

  it('should return the actual language when query string and header both are missing', function * () {
    const self = this
    yield this.Antl.reload()
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return null
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').expect(200)
    assert.equal(response.body.currentLocale, 'en')
  })

  it('should return the actual language when query string is set to empty string', function * () {
    const self = this
    yield this.Antl.reload()
    const middleware = new AntlMiddleware(setup.Config, this.Antl)
    const server = http.createServer(function (req, res) {
      const request = {
        language: function (languages) {
          const acc = accepts(req)
          return acc.language(languages)
        },
        input: function () {
          return ''
        }
      }
      co(function * () {
        yield middleware.handle(request, {}, function * () {})
      })
      .then(() => {
        const currentLocale = self.Antl.getLocale()
        res.writeHead(200, {'content-type': 'application/json'})
        res.write(JSON.stringify({ currentLocale }))
        res.end()
      }).catch((error) => {
        res.writeHead(500, {'content-type': 'application/json'})
        res.write(JSON.stringify({ error: error.message }))
        res.end()
      })
    })
    const response = yield request(server).get('/').expect(200)
    assert.equal(response.body.currentLocale, 'en')
  })
})
