/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import edge from 'edge.js'
import { join } from 'node:path'
import { test } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'

import { defineConfig } from '../src/define_config.js'
import { I18nManager } from '../src/i18n_manager.js'

const BASE_URL = new URL('./tmp/', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, BASE_URL).href)
  }
  return import(filePath)
}

test.group('I18n Provider', () => {
  test('register i18n provider', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: defineConfig({
            loaders: {
              fs: {
                enabled: true,
                location: join(fs.basePath, 'resources/lang'),
              },
            },
          }),
        },
        rcFileContents: {
          providers: [() => import('../providers/i18n_provider.js')],
        },
      })
      .create(BASE_URL, {
        importer: IMPORTER,
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()
    assert.instanceOf(await app.container.make('i18n'), I18nManager)
  })

  test('register edge helpers', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          i18n: defineConfig({
            loaders: {
              fs: {
                enabled: true,
                location: join(fs.basePath, 'resources/lang'),
              },
            },
          }),
        },
        rcFileContents: {
          providers: [() => import('../providers/i18n_provider.js')],
        },
      })
      .create(BASE_URL, {
        importer: IMPORTER,
      })

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
})
