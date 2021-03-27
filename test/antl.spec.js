'use strict'

/*
 * adonis-mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const Antl = require('../src/Antl')

test.group('Antl', () => {
  test('instantiate antl', (assert) => {
    const antl = new Antl('en-us')
    assert.instanceOf(antl, Antl)
  })

  test('throw exception when locale is missing', (assert) => {
    const antl = () => new Antl()
    assert.throw(antl, 'E_INVALID_PARAMETER: Cannot instantiate antl without locale')
  })

  test('format number for a given locale', (assert) => {
    const antl = new Antl('en-us')
    assert.equal(antl.formatNumber(20), '20')
  })

  test('format amount for a given locale', (assert) => {
    const antl = new Antl('en-us')
    assert.equal(antl.formatAmount(20, 'usd'), '$20.00')
  })

  test('format date for a given locale', (assert) => {
    const antl = new Antl('en-us')
    const today = new Date()
    assert.equal(antl.formatDate(today.getTime()), `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`)
  })

  test('format relative date for a given locale', (assert) => {
    const antl = new Antl('en-us')
    const today = new Date()
    assert.equal(antl.formatRelative(today.getTime()), 'now')
  })

  test('format message for a given locale', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        header: {
          hello: 'Hello {name}'
        }
      }
    })

    assert.equal(antl.formatMessage('header.hello', { name: 'Peter' }), 'Hello Peter')
  })

  test('format message throws exception when translation is missing', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    })

    const fn = () => antl.formatMessage('validations.age.required')

    assert.throw(fn, 'E_INVALID_PARAMETER: Missing en-us translation for key \'validations.age.required\'')
  })

  test('get message for a key', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      }
    })
    assert.equal(antl.get('validations.name.required'), 'Name is required')
  })

  test('get message from fallback values', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    })
    assert.equal(antl.get('validations.email.required'), 'Email is required')
  })

  test('get message from fallback values when fallback key name is `fallback`', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      fallback: {
        validations: {
          'email.required': 'Email is required'
        }
      }
    })
    assert.equal(antl.get('validations.email.required'), 'Email is required')
  })

  test('return current locale', (assert) => {
    const antl = new Antl('en-us')
    assert.equal(antl.currentLocale(), 'en-us')
  })

  test('return the default value when nothing has been found', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    })
    assert.equal(antl.get('validations.age.required', 'translation missing'), 'translation missing')
  })

  test('return null when unable to find value and no default value is defined', (assert) => {
    const antl = new Antl('en-us', {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    })
    assert.isNull(antl.get('validations.age.required'))
  })

  test('return a list of strings', (assert) => {
    const messages = {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    }

    const antl = new Antl('en-us', messages)
    assert.deepEqual(antl.list(), messages['en-us'])
  })

  test('return a list of strings for a given group', (assert) => {
    const messages = {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    }

    const antl = new Antl('en-us', messages)
    assert.deepEqual(antl.list('validations'), messages['en-us'].validations)
  })

  test('return flat list of messages', (assert) => {
    const messages = {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    }

    const antl = new Antl('en-us', messages)
    assert.deepEqual(antl.flatList(), { 'validations.name.required': 'Name is required' })
  })

  test('return list of available locales', (assert) => {
    const messages = {
      'en-us': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      'en-gb': {
        validations: {
          'name.required': 'Name is required'
        }
      },
      '*': {
        validations: {
          'email.required': 'Email is required'
        }
      }
    }

    const antl = new Antl('en-us', messages)
    assert.deepEqual(antl.availableLocales(), ['en-us', 'en-gb'])
  })
})
