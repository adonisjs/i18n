/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { FsLoader } from '../src/Loaders/Fs'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Fs loader', (group) => {
  group.afterEach(async () => fs.cleanup())

  test('load all .json files from the config location', async (assert) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'messages.greeting': 'hello world',
      },
    })
  })

  test('flatten the nested messages', async (assert) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/validator/shared.json',
      JSON.stringify({
        required: 'field is required',
      })
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'validator.shared.required': 'field is required',
      },
    })
  })

  test('do not raise exception when the lang dir is missing', async (assert) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {})
  })
})
