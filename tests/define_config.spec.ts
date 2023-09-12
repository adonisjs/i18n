/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { defineConfig } from '../index.js'
import { FsLoader } from '../src/loaders/fs_loader.js'
import { IcuFormatter } from '../src/formatters/icu_messages_formatter.js'

test.group('Define config', () => {
  test('throw error when missing formatter', ({ assert }) => {
    assert.throws(
      () => defineConfig({}),
      'Cannot configure i18n manager. Missing property "formatter"'
    )
  })

  test('resolve formatter using formattersList', ({ assert }) => {
    const config = defineConfig({
      formatter: 'icu',
    })

    assert.isFunction(config.formatter)
    assert.instanceOf(config.formatter(config), IcuFormatter)
  })

  test('resolve loader using loadersList', ({ fs, assert }) => {
    const config = defineConfig({
      formatter: 'icu',
      loaders: [
        {
          driver: 'fs',
          location: fs.basePath,
        },
      ],
    })

    assert.isFunction(config.loaders[0])
    assert.instanceOf(config.loaders[0](config), FsLoader)
  })
})
