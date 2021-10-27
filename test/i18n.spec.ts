/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'

import { I18n } from '../src/I18n'
import { setup, fs } from '../test-helpers'
import { I18nManager } from '../src/I18nManager'
import { validatorBindings } from '../src/Bindings/Validator'

test.group('I18n', (group) => {
  group.afterEach(async () => fs.cleanup())

  test('format a message by its identifier', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'The price is {price, number, ::currency/INR}',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('en', emitter, logger, i18nManager)
    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('use fallback messages when actual message is missing', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'The price is {price, number, ::currency/USD}',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('fr', emitter, logger, i18nManager)
    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is 100,00 $US')
  })

  test('report missing translations via events', async (assert, done) => {
    assert.plan(2)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    emitter.on('i18n:missing:translation', (payload) => {
      assert.deepEqual(payload, {
        locale: 'fr',
        identifier: 'messages.greeting',
        hasFallback: false,
      })
      done()
    })

    await fs.add(
      'resources/lang/it/messages.json',
      JSON.stringify({
        greeting: 'The price is {price, number, ::currency/USD}',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('fr', emitter, logger, i18nManager)
    assert.equal(
      i18n.formatMessage('messages.greeting', { price: 100 }),
      'translation missing: en-in, greeting'
    )
  })

  test('use fallback locale defined inside the config', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'The price is {price, number, ::currency/USD}',
      })
    )

    await fs.add(
      'resources/lang/es/messages.json',
      JSON.stringify({
        greeting: 'El precio es {price, number, ::currency/USD}',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      fallbackLocales: {
        ca: 'es',
      },
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('ca', emitter, logger, i18nManager)
    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'El precio es 100,00 USD')
  })

  test('switch locale and fallback locale during switchLocale call', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'The price is {price, number, ::currency/USD}',
      })
    )

    await fs.add(
      'resources/lang/es/messages.json',
      JSON.stringify({
        greeting: 'El precio es {price, number, ::currency/USD}',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      fallbackLocales: {
        ca: 'es',
      },
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    const i18n = new I18n('en', emitter, logger, i18nManager)
    assert.equal(i18n.locale, 'en')
    assert.equal(i18n.fallbackLocale, 'en')

    i18n.switchLocale('ca')
    assert.equal(i18n.locale, 'ca')
    assert.equal(i18n.fallbackLocale, 'es')
  })
})

test.group('I18n | validatorBindings', (group) => {
  group.afterEach(async () => fs.cleanup())

  test('provide validation messages', async (assert) => {
    assert.plan(1)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')
    const { validator, schema } = app.container.resolveBinding('Adonis/Core/Validator')

    await fs.add(
      'resources/lang/en/validator.json',
      JSON.stringify({
        shared: {
          required: '{ field } is required',
        },
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    emitter.on('i18n:missing:translation', () => {
      throw new Error('Never expected to reach here')
    })

    await i18nManager.loadTranslations()
    validatorBindings(validator, i18nManager)

    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string(),
        }),
        data: {},
      })
    } catch (error) {
      assert.deepEqual(error.messages, { username: ['username is required'] })
    }
  })

  test('give priority to field + rule messages', async (assert) => {
    assert.plan(1)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')
    const { validator, schema } = app.container.resolveBinding('Adonis/Core/Validator')

    await fs.add(
      'resources/lang/en/validator.json',
      JSON.stringify({
        shared: {
          'required': '{ field } is required',
          'username.required': 'username is required to signup',
        },
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    emitter.on('i18n:missing:translation', () => {
      throw new Error('Never expected to reach here')
    })

    await i18nManager.loadTranslations()
    validatorBindings(validator, i18nManager)

    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string(),
        }),
        data: {},
      })
    } catch (error) {
      assert.deepEqual(error.messages, { username: ['username is required to signup'] })
    }
  })

  test('report missing validation translation for just the rule', async (assert) => {
    assert.plan(2)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')
    const { validator, schema } = app.container.resolveBinding('Adonis/Core/Validator')

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()
    validatorBindings(validator, i18nManager)

    emitter.on('i18n:missing:translation', (payload) => {
      assert.deepEqual(payload, {
        locale: 'en',
        identifier: 'validator.shared.required',
        hasFallback: false,
      })
    })

    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string(),
        }),
        data: {},
      })
    } catch (error) {
      assert.deepEqual(error.messages, { username: ['required validation failed on username'] })
    }
  })

  test('report missing translation for the exact key that has a fallback', async (assert) => {
    assert.plan(2)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')
    const { validator, schema } = app.container.resolveBinding('Adonis/Core/Validator')

    await fs.add(
      'resources/lang/en/validator.json',
      JSON.stringify({
        shared: {
          'required': '{ field } is required',
          'username.required': 'username is required to signup',
        },
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()
    validator.messages(() => i18nManager.locale('it').validatorMessages())

    emitter.on('i18n:missing:translation', (payload) => {
      assert.deepEqual(payload, {
        locale: 'it',
        identifier: 'validator.shared.username.required',
        hasFallback: true,
      })
    })

    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string(),
        }),
        data: {},
      })
    } catch (error) {
      assert.deepEqual(error.messages, { username: ['username is required to signup'] })
    }
  })

  test('find if a message exists', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: '',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('en', emitter, logger, i18nManager)
    assert.isTrue(i18n.hasMessage('messages.greeting'))
    assert.isFalse(i18n.hasMessage('messages.title'))
  })

  test('find if a fallback message exists', async (assert) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: '',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()

    const i18n = new I18n('fr', emitter, logger, i18nManager)
    assert.isFalse(i18n.hasMessage('messages.greeting'))
    assert.isTrue(i18n.hasFallbackMessage('messages.greeting'))
  })

  test('provide validation messages', async (assert) => {
    assert.plan(1)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')
    const { validator, schema, rules } = app.container.resolveBinding('Adonis/Core/Validator')

    await fs.add(
      'resources/lang/en/validator.json',
      JSON.stringify({
        shared: {
          minLength: 'Field must be { minLength } chars long',
        },
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    emitter.on('i18n:missing:translation', () => {
      throw new Error('Never expected to reach here')
    })

    await i18nManager.loadTranslations()
    validatorBindings(validator, i18nManager)

    try {
      await validator.validate({
        schema: schema.create({
          username: schema.string({}, [rules.minLength(5)]),
        }),
        data: {
          username: 'a',
        },
      })
    } catch (error) {
      assert.deepEqual(error.messages, { username: ['Field must be 5 chars long'] })
    }
  })
})
