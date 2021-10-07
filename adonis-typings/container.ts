/*
 * @adonisjs/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { I18nManagerContract } from '@ioc:Adonis/Addons/I18n'

  interface ContainerBindings {
    'Adonis/Addons/I18n': I18nManagerContract
  }
}
