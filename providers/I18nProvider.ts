/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { I18nManager } from '../src/I18nManager'
import { viewBindings } from '../src/Bindings/View'
import { contextBindings } from '../src/Bindings/Context'
import { validatorBindings } from '../src/Bindings/Validator'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class I18nProvider {
  constructor(protected application: ApplicationContract) {}

  /**
   * Register I18n as a binding to the container
   */
  public register() {
    this.application.container.singleton('Adonis/Addons/I18n', () => {
      const emitter = this.application.container.resolveBinding('Adonis/Core/Event')
      const logger = this.application.container.resolveBinding('Adonis/Core/Logger')
      const config = this.application.container.resolveBinding('Adonis/Core/Config').get('i18n', {})
      return new I18nManager(this.application, emitter, logger, config)
    })
  }

  /**
   * Register i18n instance to the HTTP context and create the "t"
   * helper
   */
  public boot() {
    const I18n = this.application.container.resolveBinding('Adonis/Addons/I18n')

    /**
     * Share I18n instance with the HTTP context
     */
    this.application.container.withBindings(['Adonis/Core/HttpContext'], (Context) => {
      contextBindings(Context, I18n)
    })

    /**
     * Add required globals to the template engine
     */
    this.application.container.withBindings(['Adonis/Core/View'], (View) => {
      viewBindings(View, I18n)
    })

    /**
     * Hook into validator to provide default validation messages
     */
    if (I18n.config.provideValidatorMessages === true) {
      this.application.container.withBindings(['Adonis/Core/Validator'], ({ validator }) => {
        validatorBindings(validator, I18n)
      })
    }

    /**
     * Register repl binding when in repl environment
     */
    if (this.application.environment === 'repl') {
      this.application.container.withBindings(['Adonis/Addons/Repl'], (Repl) => {
        const { replBindings } = require('../src/Bindings/Repl')
        replBindings(this.application, Repl)
      })
    }
  }

  /**
   * Hook into start lifecycle to load all translation
   * messages
   */
  public async ready() {
    const I18n = this.application.container.resolveBinding('Adonis/Addons/I18n')
    await I18n.loadTranslations()
  }
}
