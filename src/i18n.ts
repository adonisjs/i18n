/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Emitter } from '@adonisjs/core/events'

import debug from './debug.js'
import type { I18nManager } from './i18n_manager.js'
import { Formatter } from './formatters/values_formatter.js'
import type { MissingTranslationEventPayload } from './types.js'
import { I18nMessagesProvider } from './vine_i18n_messages_provider.js'

/**
 * I18n exposes the APIs to format values and translate messages
 * for a given locale.
 *
 * Under the hood it uses the I18nManager to load translations data
 */
export class I18n extends Formatter {
  #i18nManager: I18nManager
  #emitter: Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload } & any>

  /**
   * Translations for the selected locale
   */
  localeTranslations: Record<string, string>

  /**
   * Translations for the fallback locale. The fallback translations
   * are used when the selected locale translations are missing
   */
  fallbackTranslations: Record<string, string>

  /**
   * The fallback locale for the current instance.
   */
  fallbackLocale: string

  /**
   * Creates a messages provider for VineJS
   */
  createMessagesProvider(prefix: string = 'validator.shared') {
    return new I18nMessagesProvider(prefix, this)
  }

  constructor(
    locale: string,
    emitter: Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload } & any>,
    i18nManager: I18nManager
  ) {
    super(locale)

    this.#emitter = emitter
    this.#i18nManager = i18nManager
    this.fallbackLocale = this.#i18nManager.getFallbackLocaleFor(locale)
    this.localeTranslations = this.#i18nManager.getTranslationsFor(this.locale)
    this.fallbackTranslations = this.#i18nManager.getTranslationsFor(this.fallbackLocale)

    debug('creating i18n for locale "%s" with fallback locale "%s"', locale, this.fallbackLocale)
  }

  /**
   * Emits the missing translation message
   */
  #notifyForMissingTranslation(identifier: string, hasFallback: boolean) {
    this.#emitter.emit('i18n:missing:translation', {
      locale: this.locale,
      identifier,
      hasFallback,
    })
  }

  /**
   * Returns the message for a given identifier
   */
  resolveIdentifier(identifier: string): { message: string; isFallback: boolean } | null {
    let message = this.localeTranslations[identifier]

    /**
     * Return the translation (if exists)
     */
    if (message) {
      return { message, isFallback: false }
    }

    /**
     * Look for translation inside the fallback messages
     */
    message = this.fallbackTranslations[identifier]
    if (message) {
      return { message, isFallback: true }
    }

    return null
  }

  /**
   * Returns a boolean identifying if the message for a given
   * identifier exists or not
   */
  hasMessage(identifier: string): boolean {
    return this.localeTranslations[identifier] !== undefined
  }

  /**
   * Returns a boolean identifying if a fallback message for a given
   * identifier exists or not
   */
  hasFallbackMessage(identifier: string): boolean {
    return this.fallbackTranslations[identifier] !== undefined
  }

  /**
   * Switch locale for the current instance
   */
  switchLocale(locale: string) {
    debug('switching locale from "%s" to "%s"', this.locale, locale)

    super.switchLocale(locale)
    this.fallbackLocale = this.#i18nManager.getFallbackLocaleFor(this.locale)
    this.localeTranslations = this.#i18nManager.getTranslationsFor(this.locale)
    this.fallbackTranslations = this.#i18nManager.getTranslationsFor(this.fallbackLocale)
  }

  /**
   * Formats a message using the messages formatter
   */
  formatMessage(identifier: string, data?: Record<string, any>, fallbackMessage?: string): string {
    const message = this.resolveIdentifier(identifier)

    if (!message) {
      this.#notifyForMissingTranslation(identifier, false)
    } else if (message.isFallback) {
      this.#notifyForMissingTranslation(identifier, true)
    }

    if (message) {
      return this.formatRawMessage(message.message, data)
    }

    /**
     * Return the inline fallback message (when defined)
     */
    if (fallbackMessage !== undefined) {
      return fallbackMessage
    }

    /**
     * Return the global fallback message (when defined)
     */
    const globalFallbackMessage = this.#i18nManager.getFallbackMessage(identifier, this.locale)
    if (globalFallbackMessage !== undefined) {
      return globalFallbackMessage
    }

    /**
     * Otherwise return error message string
     */
    return `translation missing: ${this.locale}, ${identifier}`
  }

  /**
   * Shorthand method for formatUsage
   * @alias formatUsage
   */
  t(identifier: string, data?: Record<string, any>, fallbackMessage?: string): string {
    return this.formatMessage(identifier, data, fallbackMessage)
  }

  /**
   * Formats a message using the messages formatter
   */
  formatRawMessage(message: string, data?: Record<string, any>): string {
    return this.#i18nManager.getFormatter().format(message, this.locale, data)
  }

  /**
   * Returns all translations
   */
  getTranslations(): {[lang: string]: Record<string, string>} {
    return this.#i18nManager.getTranslations()
  }
}
