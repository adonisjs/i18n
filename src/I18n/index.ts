/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { LoggerContract } from '@ioc:Adonis/Core/Logger'
import { EmitterContract } from '@ioc:Adonis/Core/Event'
import { I18nContract, I18nManagerContract } from '@ioc:Adonis/Addons/I18n'
import { Formatter } from '../Formatters/Core'

/**
 * I18n class works with a dedicated locale at a given point
 * in time
 */
export class I18n extends Formatter implements I18nContract {
  /**
   * Locale translations
   */
  private localeTranslations: Record<string, string>

  /**
   * Fallback translations
   */
  private fallbackTranslations: Record<string, string>

  /**
   * Lazy load messages. Doing this as i18n class usually results in switchLocale
   * during real world use cases
   */
  private lazyLoadMessages() {
    if (!this.localeTranslations && !this.fallbackTranslations) {
      this.localeTranslations = this.i18nManager.getTranslationsFor(this.locale)
      this.fallbackTranslations = this.i18nManager.getTranslationsFor(
        this.i18nManager.defaultLocale
      )
    }
  }

  constructor(
    public locale: string,
    private emitter: EmitterContract,
    private logger: LoggerContract,
    private i18nManager: I18nManagerContract
  ) {
    super(locale)
  }

  /**
   * Switch locale for the current instance
   */
  public switchLocale(locale: string) {
    this.locale = locale
    this.logger.debug('switching locale to "%s"', this.locale)
    this.localeTranslations = this.i18nManager.getTranslationsFor(this.locale)
    this.fallbackTranslations = this.i18nManager.getTranslationsFor(this.i18nManager.defaultLocale)
  }

  /**
   * Formats a message using the messages formatter
   */
  public formatMessage(identifier: string, data: Record<string, any>): string {
    this.lazyLoadMessages()
    let message = this.localeTranslations[identifier]

    /**
     * Attempt to read message from the fallback messages
     */
    if (!message) {
      message = this.fallbackTranslations[identifier]

      /**
       * Notify user about the missing translation
       */
      this.emitter.emit('i18n:missing:translation', {
        locale: this.locale,
        identifier,
        hasFallback: !!message,
      })
    }

    /**
     * Return translation missing string when there is no fallback
     * as well
     */
    if (!message) {
      return `translation missing: ${this.locale}, ${identifier}`
    }

    return this.formatRawMessage(message, data)
  }

  /**
   * Formats a message using the messages formatter
   */
  public formatRawMessage(message: string, data: Record<string, any>): string {
    return this.i18nManager.getFormatter().format(message, this.locale, data)
  }
}
