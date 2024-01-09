/*
 * @adonisjs/session
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IgnitorFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  test('create config file and register provider', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/kernel.ts', `router.use([])`)
    await fs.create('adonisrc.ts', `export default defineConfig({}) {}`)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileExists('config/i18n.ts')
    await assert.fileExists('app/middleware/detect_user_locale_middleware.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@adonisjs/i18n/i18n_provider')
    await assert.fileContains('config/i18n.ts', 'defineConfig')
    await assert.fileContains(
      'start/kernel.ts',
      `() => import('#middleware/detect_user_locale_middleware')`
    )
    await assert.fileContains(
      'app/middleware/detect_user_locale_middleware.ts',
      `export default class DetectUserLocaleMiddleware`
    )
  }).timeout(60 * 1000)
})
