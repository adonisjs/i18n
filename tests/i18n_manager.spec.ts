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
import { FsLoader } from '../src/loaders/fs.js'
import { I18nManager } from '../src/i18n_manager.js'
import { IcuFormatter } from '../src/messages_formatters/icu.js'
import type { MissingTranslationEventPayload } from '../src/types/main.js'

const BASE_URL = new URL('./', import.meta.url)
const app = new AppFactory().create(BASE_URL, () => {})
const emitter = new Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload }>(app)

test.group('I18nManager', () => {
  test('get i18n instance using manager', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    assert.instanceOf(i18nManager.locale(i18nManager.defaultLocale), I18n)
  })

  test('get translations object', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

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

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [
        () => new FsLoader({ location: join(fs.basePath, 'resources/lang') }),
        () => new FsLoader({ location: join(fs.basePath, 'resources/admin') }),
      ],
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

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.greeting', {}), 'hello world')
  })

  test('work fine when no loaders are registered', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [],
    })

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(
      i18n.formatMessage('messages.greeting', {}),
      'translation missing: en, messages.greeting'
    )
  })

  test('reload messages', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {})

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

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
    class MemoryLoader {
      async load() {
        return {
          en: {
            'messages.foo': 'hello foo',
          },
        }
      }
    }

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new MemoryLoader()],
    })

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.foo', {}), 'hello foo')
  })

  test('add a custom formatter', async ({ assert }) => {
    class MemoryLoader {
      async load() {
        return {
          en: {
            'messages.greeting': 'hello foo',
          },
        }
      }
    }

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => {
        return {
          name: 'simple',
          format(message) {
            return message.replace('world', 'foo')
          },
        }
      },
      loaders: [() => new MemoryLoader()],
    })

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale(i18nManager.defaultLocale)
    assert.equal(i18n.formatMessage('messages.greeting', {}), 'hello foo')
  })

  test('infer supported languages from translations', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en'])
  })

  test('consider fallback locales in supported locales', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      fallbackLocales: {
        es: 'en',
      },
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    assert.deepEqual(i18nManager.supportedLocales(), ['en', 'es'])
  })

  test('trust supportLocales as the final source of truth', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      supportedLocales: ['en', 'fr'],
      fallbackLocales: {
        es: 'en',
      },
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

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

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
      supportedLocales: ['en', 'es', 'fr'],
      fallbackLocales: {
        es: 'fr',
      },
    })

    await i18nManager.loadTranslations()
    const i18n = i18nManager.locale('es')

    assert.equal(i18n.t('message.greeting'), 'translation missing: es, message.greeting')
  })

  test('find best supported language based upon user languages', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      supportedLocales: ['en', 'fr', 'it', 'ca'],
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    i18nManager.loadTranslations()
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK']), 'en')
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK', 'fr']), 'fr')
    assert.equal(i18nManager.getSupportedLocaleFor(['en-UK;q=0.9', 'fr;q=0.7']), 'en')
  })

  test('find the best supported fallback locale', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'it',
      formatter: () => new IcuFormatter(),
      supportedLocales: ['en', 'en-UK', 'en-US', 'fr', 'it', 'ca'],
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    i18nManager.loadTranslations()
    assert.equal(i18nManager.getFallbackLocaleFor('en-UK'), 'en')
    assert.equal(i18nManager.getFallbackLocaleFor('en-US'), 'en')
    assert.equal(i18nManager.getFallbackLocaleFor('fr'), 'it')
  })
})
