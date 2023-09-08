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
import type { MissingTranslationEventPayload } from '../src/types/main.js'

const app = new AppFactory().create(new URL('./', import.meta.url), () => {})
const emitter = new Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload }>(app)

test.group('I18n', () => {
  test('format a message by its identifier', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
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
    const i18n = new I18n('en', emitter, i18nManager)

    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('format a message by its identifier using short method i18n.t()', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
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
    const i18n = new I18n('en', emitter, i18nManager)

    assert.equal(i18n.t('messages.greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('use fallback locale when selected locale messages are missing', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/USD}',
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
    const i18n = new I18n('fr', emitter, i18nManager)
    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is 100,00 $US')
  })

  test('report missing translations via events', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        defaultLocale: 'fr',
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    const [event, message] = await Promise.all([
      new Promise((resolve) => {
        emitter.on('i18n:missing:translation', (payload) => resolve(payload))
      }),
      i18n.formatMessage('messages.greeting', { price: 100 }),
    ])

    assert.deepEqual(event, {
      locale: 'fr',
      identifier: 'messages.greeting',
      hasFallback: false,
    })
    assert.equal(message, 'translation missing: fr, messages.greeting')
  })

  test('check if a translation exists', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        defaultLocale: 'fr',
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    assert.isFalse(i18n.hasMessage('messages.greeting'))

    i18n.switchLocale('en')
    assert.isTrue(i18n.hasMessage('messages.greeting'))
  })

  test('check if a translation exists for the fallback locale', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(
      emitter,
      defineConfig({
        defaultLocale: 'en',
        loaders: {
          fs: {
            enabled: true,
            location: join(fs.basePath, 'resources/lang'),
          },
        },
      })
    )

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    assert.isFalse(i18n.hasMessage('messages.greeting'))
    assert.isTrue(i18n.hasFallbackMessage('messages.greeting'))
  })
})
