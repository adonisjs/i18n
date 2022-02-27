/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'

import { I18n } from '../src/I18n'
import { fs, setup } from '../test-helpers'
import { I18nManager } from '../src/I18nManager'

test.group('I18nManager', (group) => {
  group.each.teardown(async () => fs.cleanup())

  test('get i18n instance using manager', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

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
    assert.instanceOf(i18nManager.locale(i18nManager.defaultLocale), I18n)
  })

  test('format message using identifier', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
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
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'hello world'
    )
  })

  test('do not load messages when loader is disabled', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: false,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'translation missing: en, messages.greeting'
    )
  })

  test('reload messages', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add('resources/lang/en/messages.json', JSON.stringify({}))

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
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'translation missing: en, messages.greeting'
    )

    /**
     * Calling this method cleans up the require cache
     */
    await fs.cleanup()

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    await i18nManager.reloadTranslations()
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'hello world'
    )
  })

  test('add a custom loader', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
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
        memory: {
          enabled: true,
        },
      },
    })

    i18nManager.extend('memory', 'loader', () => {
      return {
        async load() {
          return {
            en: {
              'messages.foo': 'hello foo',
            },
          }
        },
      }
    })

    await i18nManager.loadTranslations()
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'hello world'
    )

    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.foo', {}),
      'hello foo'
    )
  })

  test('add a custom formatter', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'simple',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    i18nManager.extend('simple', 'formatter', () => {
      return {
        name: 'simple',
        format(message) {
          return message.replace('world', 'foo')
        },
      }
    })

    await i18nManager.loadTranslations()
    assert.equal(
      i18nManager.locale(i18nManager.defaultLocale).formatMessage('messages.greeting', {}),
      'hello foo'
    )
  })

  test('raise error when formatter is missing', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'simple',
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    assert.throws(
      () => i18nManager.getFormatter(),
      'E_INVALID_INTL_FORMATTER: Invalid formatter "simple"'
    )
  })

  test('raise error when loader is missing', async ({ assert }) => {
    assert.plan(1)

    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'simple',
      provideValidatorMessages: true,
      loaders: {
        memory: {
          enabled: true,
        },
      },
    })

    try {
      await i18nManager.loadTranslations()
    } catch ({ message }) {
      assert.equal(message, 'E_INVALID_INTL_LOADER: Invalid loader "memory"')
    }
  })

  test('return supported languages', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
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
    assert.deepEqual(i18nManager.supportedLocales(), ['en'])
  })

  test('return supported languages when multiple loaders are configured', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
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
        memory: {
          enabled: true,
        },
      },
    })

    i18nManager.extend('memory', 'loader', () => {
      return {
        async load() {
          return {
            en: {
              'messages.foo': 'hello foo',
            },
            fr: {
              'messages.foo': 'Bonjour foo',
            },
          }
        },
      }
    })

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en', 'fr'])
  })

  test('return supported configured via config', async ({ assert }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const i18nManager = new I18nManager(app, emitter, logger, {
      defaultLocale: 'en',
      translationsFormat: 'icu',
      supportedLocales: ['en', 'it', 'fr'],
      provideValidatorMessages: true,
      loaders: {
        fs: {
          enabled: true,
          location: join(fs.basePath, 'resources/lang'),
        },
      },
    })

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en', 'it', 'fr'])
  })

  test('reset supported languages when reloadTranslations changes languages', async ({
    assert,
  }) => {
    const app = await setup()
    const emitter = app.container.resolveBinding('Adonis/Core/Event')
    const logger = app.container.resolveBinding('Adonis/Core/Logger')

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
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
        memory: {
          enabled: true,
        },
      },
    })

    i18nManager.extend('memory', 'loader', () => {
      return {
        async load() {
          return {
            en: {
              'messages.foo': 'hello foo',
            },
            fr: {
              'messages.foo': 'Bonjour foo',
            },
          }
        },
      }
    })

    await i18nManager.loadTranslations()

    i18nManager.extend('memory', 'loader', () => {
      return {
        async load() {
          return {
            en: {
              'messages.foo': 'hello foo',
            },
          }
        },
      }
    })

    await i18nManager.reloadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en'])
  })
})
