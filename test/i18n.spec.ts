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
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
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
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
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
})
