/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { I18n } from '../src/I18n'
import { fs, setup } from '../test-helpers'
import { I18nManager } from '../src/I18nManager'

test.group('I18n Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register i18n provider', async ({ assert }) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        translationsFormat: 'icu',
        loaders: {},
      },
      ['../../providers/I18nProvider']
    )

    assert.instanceOf(app.container.use('Adonis/Addons/I18n'), I18nManager)
    assert.deepEqual(
      app.container.use('Adonis/Addons/I18n'),
      app.container.use('Adonis/Addons/I18n')
    )
  })

  test('raise error when config is missing', async ({ assert }) => {
    assert.plan(1)

    try {
      await setup({}, ['../../providers/I18nProvider'])
    } catch ({ message }) {
      assert.equal(message, 'Missing "loaders" config inside "config/i18n.ts" file')
    }
  })

  test('define context i18n getter', async ({ assert }) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        translationsFormat: 'icu',
        loaders: {},
      },
      ['../../providers/I18nProvider']
    )

    assert.instanceOf(app.container.use('Adonis/Core/HttpContext').create('/', {}).i18n, I18n)
  })

  test('register "t" translation helper', async ({ assert }) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        translationsFormat: 'icu',
        loaders: {},
      },
      ['../../providers/I18nProvider']
    )

    const HttpContext = app.container.use('Adonis/Core/HttpContext').create('/', {})
    const View = app.container.use('Adonis/Core/View')
    const view = View.share({ i18n: HttpContext.i18n })

    const value = await view.renderRaw(`{{ t('messages.greeting') }}`)
    assert.equal(value, 'translation missing: en, messages.greeting')
  })

  test('raise exception from "t" helper when i18n is not shared with view', async ({ assert }) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        translationsFormat: 'icu',
        loaders: {},
      },
      ['../../providers/I18nProvider']
    )

    const View = app.container.use('Adonis/Core/View')
    try {
      await View.renderRaw(`{{ t('messages.greeting') }}`)
    } catch ({ message }) {
      assert.equal(
        message,
        'Cannot locate "i18n" object. Make sure your are sharing it with the view inside the "DetectUserLocale" middleware'
      )
    }
  })

  test('register repl bindings in repl environment', async ({ assert }) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        translationsFormat: 'icu',
        loaders: {},
      },
      ['@adonisjs/repl', '../../providers/I18nProvider'],
      'repl'
    )

    const Repl = app.container.use('Adonis/Addons/Repl')
    assert.property(Repl['customMethods'], 'loadI18n')
  })
})
