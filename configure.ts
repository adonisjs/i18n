/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  /**
   * Publish config file
   */
  await command.publishStub('config.stub')

  /**
   * Publish middleware file
   */
  await command.publishStub('detect_user_locale.stub', {
    entity: command.app.generators.createEntity('detect_user_locale'),
  })

  const codemods = await command.createCodemods()

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
  })
}
