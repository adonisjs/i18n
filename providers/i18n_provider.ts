/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import { RuntimeException } from '@poppinss/utils'

import { I18nManager } from '../src/i18n_manager.js'
import type { ApplicationService } from '@adonisjs/core/types'
import type { MissingTranslationEventPayload } from '../src/types.js'

declare module '@adonisjs/core/types' {
  export interface EventsList {
    'i18n:missing:translation': MissingTranslationEventPayload
  }
  export interface ContainerBindings {
    i18n: I18nManager
  }
}

/**
 * Registers a singleton instance of I18nManager to the container,
 * register edge helpers and repl bindings
 */
export default class I18nProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Registers edge plugin when edge is installed
   */
  protected async registerEdgePlugin(i18nManager: I18nManager) {
    if (this.app.usingEdgeJS) {
      const edge = await import('edge.js')
      const { edgePluginI18n } = await import('../src/plugins/edge.js')
      edge.default.use(edgePluginI18n(i18nManager))
    }
  }

  /**
   * Registers repl bindings
   */
  protected async registerReplBindings() {
    if (this.app.getEnvironment() === 'repl') {
      const { registerReplBindings } = await import('../src/repl_bindings.js')
      registerReplBindings(this.app, await this.app.container.make('repl'))
    }
  }

  /**
   * Register i18n manager to the container
   */
  register() {
    this.app.container.singleton('i18n', async (resolver) => {
      const i18nConfigProvider = this.app.config.get('i18n')
      const config = await configProvider.resolve<any>(this.app, i18nConfigProvider)

      if (!config) {
        throw new RuntimeException(
          'Invalid default export from "config/i18n.ts" file. Make sure to use defineConfig method'
        )
      }

      const emitter = await resolver.make('emitter')
      return new I18nManager(emitter, config)
    })
  }

  /**
   * Load translations, register edge helpers and
   * define repl bindings
   */
  async boot() {
    /**
     * Loading translation on boot. There is no simple way to defer
     * loading of translations and hence we have to do it at
     * boot time.
     */
    const i18nManager = await this.app.container.make('i18n')
    await i18nManager.loadTranslations()

    await this.registerEdgePlugin(i18nManager)
    await this.registerReplBindings()
  }
}
