/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { FsLoader } from '../src/Loaders/Fs'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Fs loader | JSON', (group) => {
  group.each.teardown(async () => fs.cleanup())

  test('load all .json files from the config location', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    await fs.add(
      'resources/lang/en/shared/messages.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    await fs.add(
      'resources/lang/en/messages/validator.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'messages.greeting': 'hello world',
        'shared.messages.greeting': 'hello world',
        'messages.validator.greeting': 'hello world',
      },
    })
  })

  test('flatten the nested messages', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/validator/shared.json',
      JSON.stringify({
        required: 'field is required',
        signup: {
          required: 'field is required to signup',
        },
      })
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'validator.shared.required': 'field is required',
        'validator.shared.signup.required': 'field is required to signup',
      },
    })
  })

  test('load messages from language files', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    await fs.add(
      'resources/lang/fr.json',
      JSON.stringify({
        greeting: 'hello world',
      })
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        greeting: 'hello world',
      },
      fr: {
        greeting: 'hello world',
      },
    })
  })

  test('do not raise exception when the lang dir is missing', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {})
  })

  test('raise error when file contents is not valid json', async ({ assert }) => {
    assert.plan(1)

    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add('resources/lang/en/validator/shared.json', '{"foo": 1,}')

    try {
      await fsLoader.load()
    } catch (error) {
      assert.equal(error.message, 'Unexpected token } in JSON at position 10')
    }
  })
})

test.group('Fs loader | YAML', (group) => {
  group.each.teardown(async () => fs.cleanup())

  test('load all .yaml files from the config location', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/messages.yaml',
      `
      greeting: hello world
      `
    )

    await fs.add(
      'resources/lang/en/shared/messages.yaml',
      `
      greeting: hello world
      `
    )

    await fs.add(
      'resources/lang/en/messages/validator.yaml',
      `
      greeting: hello world
      `
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'messages.greeting': 'hello world',
        'shared.messages.greeting': 'hello world',
        'messages.validator.greeting': 'hello world',
      },
    })
  })

  test('flatten the nested messages', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/validator/shared.yaml',
      `
      required: field is required
      signup:
        required: field is required to signup
      `
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'validator.shared.required': 'field is required',
        'validator.shared.signup.required': 'field is required to signup',
      },
    })
  })

  test('load messages from language files', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en.yaml',
      `
      greeting: hello world
      `
    )

    await fs.add(
      'resources/lang/fr.yaml',
      `
      greeting: hello world
      `
    )

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        greeting: 'hello world',
      },
      fr: {
        greeting: 'hello world',
      },
    })
  })

  test('do not raise exception when the lang dir is missing', async ({ assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {})
  })

  test('raise error when file contents is not valid yaml', async ({ assert }) => {
    assert.plan(1)

    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.add(
      'resources/lang/en/validator/shared.yaml',
      `
      foo:
      1
    `
    )

    try {
      await fsLoader.load()
    } catch (error) {
      assert.equal(error.message, 'Implicit map keys need to be followed by map values')
    }
  })
})
