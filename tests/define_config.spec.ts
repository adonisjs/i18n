/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ApplicationService } from '@adonisjs/core/types'
import { AppFactory } from '@adonisjs/core/factories/app'

import { FsLoader } from '../src/loaders/fs.js'
import { IcuFormatter } from '../src/messages_formatters/icu.js'
import { defineConfig, formatters, loaders } from '../src/define_config.js'

const BASE_URL = new URL('./', import.meta.url)
const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService

test.group('Define config', () => {
  test('throw error when missing formatter', ({ assert }) => {
    assert.rejects(
      () => defineConfig({} as any),
      'Cannot configure i18n manager. Missing property "formatter"'
    )
  })

  test('transform config with a formatter', async ({ assert }) => {
    const config = await defineConfig({
      loaders: [],
      formatter: formatters.icu(),
    }).resolver(app)

    assert.isFunction(config.formatter)
    assert.instanceOf(config.formatter(config), IcuFormatter)
  })

  test('transform config with loaders', async ({ assert }) => {
    const config = await defineConfig({
      loaders: [loaders.fs({ location: BASE_URL })],
      formatter: formatters.icu(),
    }).resolver(app)

    assert.isFunction(config.formatter)
    assert.instanceOf(config.formatter(config), IcuFormatter)

    assert.isFunction(config.loaders[0])
    assert.instanceOf(config.loaders[0](config), FsLoader)
  })
})
