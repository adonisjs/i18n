/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Emitter } from '@adonisjs/core/events'
import type { NextFn } from '@adonisjs/core/types/http'
import { AppFactory } from '@adonisjs/core/factories/app'
import { ApplicationService, EventsList } from '@adonisjs/core/types'
import { type HttpContext, RequestValidator } from '@adonisjs/core/http'

import { I18n } from '../src/i18n.js'
import { FsLoader } from '../src/loaders/fs.js'
import { I18nManagerConfig } from '../src/types.js'
import { I18nManager } from '../src/i18n_manager.js'
import { IcuFormatter } from '../src/messages_formatters/icu.js'

/**
 * Notify TypeScript about i18n property
 */
declare module '@adonisjs/core/http' {
  export interface HttpContext {
    i18n: I18n
  }
}

/**
 * The "{{ middlewareName }}" middleware uses i18n service to share
 * a request specific i18n object with the HTTP Context
 */
export default class DetectUserLocaleMiddleware {
  /**
   * Using i18n for validation messages. Applicable to only
   * "request.validateUsing" method calls
   */
  static {
    RequestValidator.messagesProvider = (ctx) => {
      return ctx.i18n.createMessagesProvider()
    }
  }

  constructor(public i18nManager: I18nManager) {}

  /**
   * This method reads the user language from the "Accept-Language"
   * header and returns the best matching locale by checking it
   * against the supported locales.
   *
   * Feel free to use different mechanism for finding user language.
   */
  protected getRequestLocale(ctx: HttpContext) {
    const userLanguages = ctx.request.languages()
    return this.i18nManager.getSupportedLocaleFor(userLanguages)
  }

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Finding user language
     */
    const language = this.getRequestLocale(ctx)

    /**
     * Assigning i18n property to the HTTP context
     */
    ctx.i18n = this.i18nManager.locale(language || this.i18nManager.defaultLocale)

    /**
     * Binding I18n class to the request specific instance of it.
     * Doing so will allow IoC container to resolve an instance
     * of request specific i18n object when I18n class is
     * injected somewhere.
     */
    ctx.containerResolver.bindValue(I18n, ctx.i18n)

    /**
     * Sharing request specific instance of i18n with edge
     * templates.
     *
     * Remove the following block of code, if you are not using
     * edge templates.
     */
    if ('view' in ctx) {
      ctx.view.share({ i18n: ctx.i18n })
    }

    return next()
  }
}

/**
 * Exposes the API to create an instance of detect user locale
 * middleware and the i18nManager
 */
export class I18nManagerFactory {
  #config: I18nManagerConfig = {
    defaultLocale: 'en',
    formatter: () => new IcuFormatter(),
    loaders: [
      () =>
        new FsLoader({
          location: './resources/lang',
        }),
    ],
  }

  /**
   * The emitter instance to use for emitting
   * events
   */
  #emitter?: Emitter<EventsList>

  /**
   * Returns an instance of app for testing
   */
  #getApp() {
    return new AppFactory().create(new URL('./', import.meta.url), () => {}) as ApplicationService
  }

  /**
   * Returns an instance of default or user defined emitter
   */
  #getEmitter() {
    return this.#emitter || new Emitter<EventsList>(this.#getApp())
  }

  /**
   * Merge custom options
   */
  merge(options: { config?: Partial<I18nManagerConfig>; emitter?: Emitter<EventsList> }) {
    if (options.config) {
      Object.assign(this.#config, options.config)
    }

    if (options.emitter) {
      this.#emitter = options.emitter
    }

    return this
  }

  /**
   * Creates an instance of the i18nManager class
   */
  create() {
    return new I18nManager(this.#getEmitter(), this.#config)
  }

  /**
   * Creates an instance of the DetectUserLocale
   * middleware
   */
  createMiddleware() {
    return new DetectUserLocaleMiddleware(this.create())
  }
}
