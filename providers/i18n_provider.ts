/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Edge } from 'edge.js'
import type { ApplicationService } from '@adonisjs/core/types'

import '../src/types/extended.js'

/**
 * Registers a singleton instance of I18nManager to the container,
 * register edge helpers and repl bindings
 */
export default class I18nProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Returns edge when it's installed
   */
  protected async getEdge(): Promise<Edge | null> {
    try {
      const { default: edge } = await import('edge.js')
      return edge
    } catch {
      return null
    }
  }

  register() {
    this.app.container.singleton('i18n', async (resolver) => {
      const { I18nManager } = await import('../src/i18n_manager.js')
      const emitter = await resolver.make('emitter')
      const config = this.app.config.get<any>('i18n', {})
      return new I18nManager(emitter, config)
    })
  }

  async boot() {
    /**
     * Loading translation on boot. There is no simple way to defer
     * loading of translations and hence we have to do it at
     * boot time.
     */
    const i18n = await this.app.container.make('i18n')
    await i18n.loadTranslations()

    /**
     * Registering edge plugin
     */
    const edge = await this.getEdge()
    if (edge) {
      const { edgePluginI18n } = await import('../src/edge_plugin_i18n.js')
      edge.use(edgePluginI18n(i18n))
    }

    /**
     * Register REPL bindings in the REPL environment
     */
    if (this.app.getEnvironment() === 'repl') {
      const { registerReplBindings } = await import('../src/repl_bindings.js')
      registerReplBindings(this.app, await this.app.container.make('repl'))
    }
  }
}
