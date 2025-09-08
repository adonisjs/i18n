/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Repl } from '@adonisjs/core/repl'
import type { ApplicationService } from '@adonisjs/core/types'

/**
 * Registers REPL bindings for the I18n service.
 * Adds a `loadI18n` method to the REPL that loads the I18n service into the context.
 *
 * @param app - The AdonisJS application service instance
 * @param Repl - The REPL instance to register bindings on
 *
 * @example
 * ```typescript
 * // In REPL after calling this function:
 * await loadI18n()
 * i18n.t('hello.world')
 * ```
 */
export function registerReplBindings(app: ApplicationService, Repl: Repl) {
  Repl.addMethod(
    'loadI18n',
    async (repl) => {
      const key = 'i18n' as const
      repl.server!.context[key] = await app.container.make(key)
      repl.notify(
        `Loaded ${key} module. You can access it using the "${repl.colors.underline(key)}" variable`
      )
    },
    {
      description: 'Load "i18n" service into the REPL context',
    }
  )
}
