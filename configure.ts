/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/i18n.stub', {})

  /**
   * Publish middleware file
   */
  await codemods.makeUsingStub(stubsRoot, 'make/middleware/detect_user_locale.stub', {
    entity: command.app.generators.createEntity('detect_user_locale'),
  })

  /**
   * Register middleware
   */
  await codemods.registerMiddleware('router', [
    {
      path: '#middleware/detect_user_locale_middleware',
    },
  ])

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@adonisjs/i18n/i18n_provider')
    rcFile.addMetaFile('resources/lang/**/*.{json,yaml,yml}', false)
  })
}
