/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import vine from '@vinejs/vine'
import { join } from 'node:path'
import { test } from '@japa/runner'
import { Emitter } from '@adonisjs/core/events'
import { AppFactory } from '@adonisjs/core/factories/app'

import { I18n } from '../src/i18n.ts'
import { FsLoader } from '../src/loaders/fs.ts'
import { I18nManager } from '../src/i18n_manager.ts'
import { IcuFormatter } from '../src/messages_formatters/icu.ts'
import type { FallbackMessageOptions, MissingTranslationEventPayload } from '../src/types.ts'
import { I18nMessagesProvider } from '../src/vine_i18n_messages_provider.ts'
import type { FieldContext } from '@vinejs/vine/types'

const app = new AppFactory().create(new URL('./', import.meta.url), () => {})
const emitter = new Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload }>(app)

test.group('I18n', () => {
  test('format a message by its identifier', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('format a message by its identifier using short method i18n.t()', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    assert.equal(i18n.t('messages.greeting', { price: 100 }), 'The price is ₹100.00')
  })

  test('use fallback locale when selected locale messages are missing', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/USD}',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)
    assert.equal(i18n.formatMessage('messages.greeting', { price: 100 }), 'The price is 100,00 $US')
  })

  test('define fallback message for missing translation', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    const message = i18n.formatMessage('messages.greeting', {}, '')
    assert.equal(message, '')
  })

  test('define fallback using global hook', async ({ fs, assert }) => {
    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      fallback: () => '',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    const message = i18n.formatMessage('messages.greeting')
    assert.equal(message, '')
  })

  test('report missing translations via events', async ({ fs, assert }) => {
    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'The price is {price, number, ::currency/INR}',
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'fr',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

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

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'fr',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

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

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('fr', emitter, i18nManager)

    assert.isFalse(i18n.hasMessage('messages.greeting'))
    assert.isTrue(i18n.hasFallbackMessage('messages.greeting'))
  })
})

test.group('I18n | validator messages provider', () => {
  test('provide validation message', async ({ fs, assert }) => {
    assert.plan(1)

    await fs.createJson('resources/lang/en/validator.json', {
      shared: {
        messages: {
          'title.required': 'Post title is required',
          'required': 'The {field} is needed',
        },
      },
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    const schema = vine.object({
      title: vine.string(),
      description: vine.string(),
      tags: vine.enum(['programming']),
    })

    try {
      await vine.validate({
        schema,
        data: { tags: '' },
        messagesProvider: i18n.createMessagesProvider(),
      })
    } catch (error) {
      assert.deepEqual(error.messages, [
        {
          field: 'title',
          message: 'Post title is required',
          rule: 'required',
        },
        {
          field: 'description',
          message: 'The description is needed',
          rule: 'required',
        },
        {
          field: 'tags',
          message: 'The selected tags is invalid',
          rule: 'enum',
          meta: {
            choices: ['programming'],
          },
        },
      ])
    }
  })

  test('provide field translations', async ({ fs, assert }) => {
    assert.plan(1)

    await fs.createJson('resources/lang/en/validator.json', {
      shared: {
        fields: {
          title: 'Post title',
          description: 'Post description',
        },
        messages: {
          required: 'The {field} is needed',
        },
      },
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    const schema = vine.object({
      title: vine.string(),
      description: vine.string(),
    })

    try {
      await vine.validate({ schema, data: {}, messagesProvider: i18n.createMessagesProvider() })
    } catch (error) {
      assert.deepEqual(error.messages, [
        {
          field: 'title',
          message: 'The Post title is needed',
          rule: 'required',
        },
        {
          field: 'description',
          message: 'The Post description is needed',
          rule: 'required',
        },
      ])
    }
  })

  test('provide other field translations', async ({ fs, assert }) => {
    assert.plan(1)

    await fs.createJson('resources/lang/en/validator.json', {
      shared: {
        fields: {
          title: 'Post title',
          summary: 'Post summary',
          description: 'Post description',
          password: 'Password',
          password_confirmation: 'Password confirmation',
        },
        messages: {
          required: 'The {field} is needed',
        },
      },
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    const schema = vine.object({
      title: vine.string(),
      description: vine.string(),
      summary: vine.string().notSameAs('description'),
      password: vine.string().confirmed(),
    })

    try {
      await vine.validate({
        schema,
        data: {
          title: 'Hello world',
          description: 'Hello world',
          summary: 'Hello world',
          password: 'Password',
          password_confirmation: 'Passwor',
        },
        messagesProvider: i18n.createMessagesProvider(),
      })
    } catch (error) {
      assert.deepEqual(error.messages, [
        {
          field: 'summary',
          message: 'The Post summary field and Post description field must be different',
          rule: 'notSameAs',
          meta: {
            otherField: 'Post description',
          },
        },
        {
          field: 'password_confirmation',
          message: 'The Password field and Password confirmation field must be the same',
          rule: 'confirmed',
          meta: {
            originalField: 'Password',
            otherField: 'Password confirmation',
          },
        },
      ])
    }
  })

  test('change message translation when extended', async ({ fs, assert }) => {
    assert.plan(1)

    await fs.createJson('resources/lang/en/validator.json', {
      shared: { fields: { numberField: 'Number field' } },
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('en', emitter, i18nManager)

    const schema = vine.object({ number_field: vine.number() })

    class CamelCaseProvider extends I18nMessagesProvider {
      translateField(name: string | number) {
        if (typeof name === 'string') {
          name = name.replaceAll(/_(\w)/g, (_, letter) => letter.toUpperCase())
        }
        return super.translateField(name)
      }
    }

    try {
      await vine.validate({
        schema,
        data: { number_field: 'string' },
        messagesProvider: new CamelCaseProvider('validator.shared', i18n),
      })
    } catch (error) {
      assert.deepEqual(error.messages, [
        {
          field: 'number_field',
          message: 'The Number field field must be a number',
          rule: 'number',
        },
      ])
    }
  })

  test('change fallback message when extended', async ({ fs, assert }) => {
    assert.plan(1)

    await fs.createJson('resources/lang/en/validator.json', {
      shared: { fields: { numberField: 'Number field' } },
    })

    const i18nManager = new I18nManager(emitter, {
      defaultLocale: 'en',
      formatter: () => new IcuFormatter(),
      loaders: [() => new FsLoader({ location: join(fs.basePath, 'resources/lang') })],
    })

    await i18nManager.loadTranslations()
    const i18n = new I18n('da', emitter, i18nManager)

    const schema = vine.object({ number_field: vine.number() })

    class FallbackProvider extends I18nMessagesProvider {
      getFallbackMessage(options: FallbackMessageOptions) {
        if (i18n.locale === 'en') return super.getFallbackMessage(options)
        return i18n.t(options.ruleIdentifier, options.meta)
      }
    }

    try {
      await vine.validate({
        schema,
        data: { number_field: 'string' },
        messagesProvider: new FallbackProvider('validator.shared', i18n),
      })
    } catch (error) {
      assert.deepEqual(error.messages, [
        {
          field: 'number_field',
          message: 'translation missing: da, validator.shared.messages.number',
          rule: 'number',
        },
      ])
    }
  })
})
