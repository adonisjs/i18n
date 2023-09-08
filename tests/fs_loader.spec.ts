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
import { FsLoader } from '../src/loaders/fs_loader.js'

test.group('Fs loader | JSON', () => {
  test('load all .json files from the config location', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.createJson('resources/lang/en/messages.json', {
      greeting: 'hello world',
    })

    await fs.createJson('resources/lang/en/shared/messages.json', {
      greeting: 'hello world',
    })

    await fs.createJson('resources/lang/en/messages/validator.json', {
      greeting: 'hello world',
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'messages.greeting': 'hello world',
        'shared.messages.greeting': 'hello world',
        'messages.validator.greeting': 'hello world',
      },
    })
  })

  test('flatten messages nested inside a JSON file', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.createJson('resources/lang/en/validator/shared.json', {
      required: 'field is required',
      signup: {
        required: 'field is required to signup',
      },
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {
      en: {
        'validator.shared.required': 'field is required',
        'validator.shared.signup.required': 'field is required to signup',
      },
    })
  })

  test('load messages for multiple languages', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.createJson('resources/lang/en.json', {
      greeting: 'hello world',
    })

    await fs.createJson('resources/lang/fr.json', {
      greeting: 'hello world',
    })

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

  test('load from empty dir', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {})
  })

  test('report JSON parsing errors', async ({ fs, assert }) => {
    assert.plan(2)

    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.create('resources/lang/en/validator/shared.json', '{"foo": 1,}')

    try {
      await fsLoader.load()
    } catch (error) {
      assert.oneOf(error.stack.split('\n')[1].trim(), [
        'at anonymous (en/validator/shared.json)',
        'at anonymous (en\\validator\\shared.json)',
      ])
      assert.oneOf(error.message, [
        'Expected double-quoted property name in JSON at position 10',
        'Unexpected token } in JSON at position 10',
      ])
    }
  })
})

test.group('Fs loader | YAML', () => {
  test('load all .yaml files from the config location', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.create(
      'resources/lang/en/messages.yaml',
      `
      greeting: hello world
      `
    )

    await fs.create(
      'resources/lang/en/shared/messages.yaml',
      `
      greeting: hello world
      `
    )

    await fs.create(
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

  test('flatten the nested messages', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.create(
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

  test('load messages for multiple languages', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.create(
      'resources/lang/en.yaml',
      `
      greeting: hello world
      `
    )

    await fs.create(
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

  test('load messages from empty directory', async ({ fs, assert }) => {
    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    const messages = await fsLoader.load()
    assert.deepEqual(messages, {})
  })

  test('report yaml parsing errors', async ({ fs, assert }) => {
    assert.plan(2)

    const fsLoader = new FsLoader({
      location: join(fs.basePath, 'resources/lang'),
    })

    await fs.create(
      'resources/lang/en/validator/shared.yaml',
      `
      foo:
      1
    `
    )

    try {
      await fsLoader.load()
    } catch (error) {
      assert.oneOf(error.stack.split('\n')[1].trim(), [
        'at anonymous (en/validator/shared.yaml)',
        'at anonymous (en\\validator\\shared.yaml)',
      ])
      assert.equal(
        error.message.trim(),
        `Implicit map keys need to be followed by map values at line 3, column 7:

      foo:
      1
      ^`
      )
    }
  })
})
