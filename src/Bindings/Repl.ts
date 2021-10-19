/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ReplContract } from '@ioc:Adonis/Addons/Repl'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Helper to define REPL state
 */
function setupReplState(repl: any, key: string, value: any) {
  repl.server.context[key] = value
  repl.notify(
    `Loaded ${key} module. You can access it using the "${repl.colors.underline(key)}" variable`
  )
}

/**
 * Define REPL bindings
 */
export function replBindings(app: ApplicationContract, Repl: ReplContract) {
  Repl.addMethod(
    'loadI18n',
    (repl) => {
      setupReplState(repl, 'I18n', app.container.use('Adonis/Addons/I18n'))
    },
    {
      description: 'Load I18n provider to the "I18n" property',
    }
  )
}
