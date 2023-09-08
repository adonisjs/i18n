/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { Emitter } from '@adonisjs/core/events'
import { AppFactory } from '@adonisjs/core/factories/app'

import { I18n } from '../src/i18n.js'
import { I18nManager } from '../src/i18n_manager.js'
import { defineConfig } from '../src/define_config.js'
import { FsLoader } from '../src/loaders/fs_loader.js'
import type { MissingTranslationEventPayload } from '../src/types/main.js'

const app = new AppFactory().create(new URL('./', import.meta.url), () => {})
const emitter = new Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload }>(app)

test.group('I18nManager', () => {
  test('get i18n instance using manager', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    assert.instanceOf(i18nManager.locale(i18nManager.defaultLocale), I18n)
  })

  test('get translations object', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.getTranslations(), {
      en: {
        'messages.greeting': 'hello world',
      },
    })
  })

  test('load translations from multiple sources', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })
    await fs.createJson('resources/admin/en/messages.json', {
      hello: 'world',
    })
    await fs.createJson('resources/admin/fr/messages.json', {
      hello: 'bonjour',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
          customFs: {
            enabled: true,
            location: join(fs.basePath, 'resources/admin'),
          },
        },
      })
    )

    i18nManager.extend('customFs', 'loader', (config) => {
      return new FsLoader(config.loaders.customFs as any)
    })

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.getTranslations(), {
      en: {
        'messages.greeting': 'hello world',
        'messages.hello': 'world',
      },
      fr: {
        'messages.hello': 'bonjour',
      },
    })
  })

  test('format message using identifier', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.greeting', {}), 'hello world')
  })

  test('do not load messages when loader is disabled', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: false,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(
      i18n.formatMessage('messages.greeting', {}),
      'translation missing: en, messages.greeting'
    )
  })

  test('reload messages', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {})

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(
      i18n.formatMessage('messages.greeting', {}),
      'translation missing: en, messages.greeting'
    )

    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    await i18nManager.reloadTranslations()
    const i18n1 = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n1.formatMessage('messages.greeting', {}), 'hello world')
  })

  test('add a custom loader', async ({ assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          memory: {
            enabled: true,
          },
        },
      })
    )

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
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.foo', {}), 'hello foo')
  })

  test('add a custom formatter', async ({ assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        translationsFormat: 'simple',
        loaders: {
          memory: {
            enabled: true,
          },
        },
      })
    )

    i18nManager.extend('memory', 'loader', () => {
      return {
        name: 'memory',
        async load() {
          return {
            en: {
              'messages.greeting': 'hello foo',
            },
          }
        },
      }
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
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.greeting', {}), 'hello foo')
  })

  test('raise error when formatter is missing', async ({ assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        translationsFormat: 'simple',
        loaders: {
          memory: {
            enabled: true,
          },
        },
      })
    )

    assert.throws(() => i18nManager.getFormatter(), 'Invalid i18n formatter "simple"')
  })

  test('raise error when loader is missing', async ({ assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        translationsFormat: 'simple',
        loaders: {
          memory: {
            enabled: true,
          },
        },
      })
    )

    await assert.rejects(() => i18nManager.loadTranslations(), 'Invalid i18n loader "memory"')
  })

  test('infer supported languages from translations', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en'])
  })

  test('consider fallback locales in supported locales', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
        fallbackLocales: {
          es: 'en',
        },
      })
    )

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en', 'es'])
  })

  test('trust supportLocales as the final source of truth', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
        supportedLocales: ['en', 'fr'],
        fallbackLocales: {
          es: 'en',
        },
      })
    )

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en', 'fr'])
  })

  test('work fine when locale is supported but does not have translations', async ({
    fs,
    assert,
  }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
        supportedLocales: ['en', 'es', 'fr'],
        fallbackLocales: {
          es: 'fr',
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale('es')

    assert.equal(i18n.t('message.greeting'), 'translation missing: es, message.greeting')
  })

  test('find best supported language based upon user languages', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        supportedLocales: ['en', 'fr', 'it', 'ca'],
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    i18nManager.loadTranslations()
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK']), 'en')
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK', 'fr']), 'fr')
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK;q=0.9', 'fr;q=0.7']), 'en')
  })
})
