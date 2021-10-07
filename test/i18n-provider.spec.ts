/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import { I18n } from '../src/I18n'
import { fs, setup } from '../test-helpers'
import { I18nManager } from '../src/I18nManager'

test.group('I18n Provider', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('register i18n provider', async (assert) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        messagesFormat: 'icu',
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

  test('raise error when config is missing', async (assert) => {
    assert.plan(1)

    try {
      await setup({}, ['../../providers/I18nProvider'])
    } catch ({ message }) {
      assert.equal(message, 'Missing "loaders" config inside "config/i18n.ts" file')
    }
  })

  test('define context i18n getter', async (assert) => {
    const app = await setup(
      {
        defaultLocale: 'en',
        messagesFormat: 'icu',
        loaders: {},
      },
      ['../../providers/I18nProvider']
    )

    assert.instanceOf(app.container.use('Adonis/Core/HttpContext').create('/', {}).i18n, I18n)
  })
})
