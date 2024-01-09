/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import edge from 'edge.js'
import { test } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'

import { I18nManager } from '../src/i18n_manager.js'
import { defineConfig, formatters, loaders } from '../src/define_config.js'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('I18n Provider', () => {
  test('register i18n provider', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: defineConfig({
            formatter: formatters.icu(),
            loaders: [
              loaders.fs({
                location: fs.baseUrl,
              }),
            ],
          }),
        },
        rcFileContents: {
          providers: [() => import('../providers/i18n_provider.js')],
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()
    assert.instanceOf(await app.container.make('i18n'), I18nManager)
  })

  test('throw error when config is invalid', async () => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: {},
        },
        rcFileContents: {
          providers: [() => import('../providers/i18n_provider.js')],
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()
    await app.container.make('i18n')
  }).throws(
    'Invalid default export from "config/i18n.ts" file. Make sure to use defineConfig method'
  )

  test('register edge helpers', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: defineConfig({
            formatter: formatters.icu(),
            loaders: [
              loaders.fs({
                location: fs.baseUrl,
              }),
            ],
          }),
        },
        rcFileContents: {
          providers: [
            () => import('@adonisjs/core/providers/edge_provider'),
            () => import('../providers/i18n_provider.js'),
          ],
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    assert.equal(await edge.renderRaw('{{ getSupportedLocales() }}'), 'en')
    assert.equal(await edge.renderRaw('{{ getDefaultLocale() }}'), 'en')
    assert.equal(await edge.renderRaw('{{ t(`message`) }}'), 'translation missing: en, message')
    assert.equal(
      await edge.renderRaw('{{ i18n.t(`message`) }}'),
      'translation missing: en, message'
    )
  })

  test('register repl bindings', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: defineConfig({
            formatter: formatters.icu(),
            loaders: [
              loaders.fs({
                location: fs.baseUrl,
              }),
            ],
          }),
        },
        rcFileContents: {
          providers: [() => import('../providers/i18n_provider.js')],
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('repl')
    await app.init()
    await app.boot()

    const repl = await app.container.make('repl')
    assert.property(repl.getMethods(), 'loadI18n')
  })
})
