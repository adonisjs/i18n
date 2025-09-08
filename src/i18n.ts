/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Emitter } from '@adonisjs/core/events'

import debug from './debug.ts'
import type { I18nManager } from './i18n_manager.ts'
import { Formatter } from './formatters/values_formatter.ts'
import type { MissingTranslationEventPayload } from './types.ts'
import { I18nMessagesProvider } from './vine_i18n_messages_provider.ts'

/**
 * I18n exposes the APIs to format values and translate messages
 * for a given locale.
 *
 * Under the hood it uses the I18nManager to load translations data
 *
 * @example
 * ```typescript
 * const i18n = new I18n('en', emitter, manager)
 * const message = i18n.t('hello.world', { name: 'John' })
 * console.log(message) // "Hello John"
 * ```
 */
export class I18n extends Formatter {
  #i18nManager: I18nManager
  #emitter: Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload } & any>

  /**
   * Translations for the selected locale
   * Contains key-value pairs of translation identifiers and their messages
   */
  localeTranslations: Record<string, string>

  /**
   * Translations for the fallback locale. The fallback translations
   * are used when the selected locale translations are missing
   * Contains key-value pairs of translation identifiers and their messages
   */
  fallbackTranslations: Record<string, string>

  /**
   * The fallback locale for the current instance.
   * Used when translations are missing in the primary locale
   */
  fallbackLocale: string

  /**
   * Creates a messages provider for VineJS validation framework
   *
   * @param prefix - The prefix to use when looking up validation messages
   * @returns A new I18nMessagesProvider instance
   *
   * @example
   * ```typescript
   * const i18n = new I18n('en', emitter, manager)
   * const provider = i18n.createMessagesProvider('validation.messages')
   * ```
   */
  createMessagesProvider(prefix: string = 'validator.shared') {
    return new I18nMessagesProvider(prefix, this)
  }

  /**
   * Creates a new I18n instance for a specific locale
   *
   * @param locale - The locale to use for this I18n instance
   * @param emitter - Event emitter for missing translation notifications
   * @param i18nManager - The I18nManager instance containing translations and configuration
   */
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
   *
   * @param identifier - The translation identifier to resolve
   * @returns Object with message and fallback status, or null if not found
   *
   * @example
   * ```typescript
   * const result = i18n.resolveIdentifier('hello.world')
   * if (result) {
   *   console.log(result.message) // "Hello World"
   *   console.log(result.isFallback) // false
   * }
   * ```
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
   *
   * @param identifier - The translation identifier to check
   * @returns True if the message exists in the current locale
   *
   * @example
   * ```typescript
   * if (i18n.hasMessage('hello.world')) {
   *   console.log('Message exists!')
   * }
   * ```
   */
  hasMessage(identifier: string): boolean {
    return this.localeTranslations[identifier] !== undefined
  }

  /**
   * Returns a boolean identifying if a fallback message for a given
   * identifier exists or not
   *
   * @param identifier - The translation identifier to check
   * @returns True if the message exists in the fallback locale
   *
   * @example
   * ```typescript
   * if (i18n.hasFallbackMessage('hello.world')) {
   *   console.log('Fallback message exists!')
   * }
   * ```
   */
  hasFallbackMessage(identifier: string): boolean {
    return this.fallbackTranslations[identifier] !== undefined
  }

  /**
   * Switch locale for the current instance
   * Updates all locale-related properties to the new locale
   *
   * @param locale - The new locale to switch to
   *
   * @example
   * ```typescript
   * i18n.switchLocale('fr')
   * console.log(i18n.locale) // "fr"
   * ```
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
   *
   * @param identifier - The translation identifier to format
   * @param data - Optional data object for message interpolation
   * @param fallbackMessage - Optional fallback message when translation is missing
   * @returns The formatted message string
   *
   * @example
   * ```typescript
   * const message = i18n.formatMessage('hello.user', { name: 'John' })
   * console.log(message) // "Hello John"
   *
   * // With fallback
   * const messageWithFallback = i18n.formatMessage('missing.key', {}, 'Default message')
   * ```
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
   * Shorthand method for formatMessage - the primary translation method
   *
   * @param identifier - The translation identifier to format
   * @param data - Optional data object for message interpolation
   * @param fallbackMessage - Optional fallback message when translation is missing
   * @returns The formatted message string
   *
   * @example
   * ```typescript
   * const message = i18n.t('welcome.message', { user: 'John' })
   * console.log(message) // "Welcome John"
   * ```
   */
  t(identifier: string, data?: Record<string, any>, fallbackMessage?: string): string {
    return this.formatMessage(identifier, data, fallbackMessage)
  }

  /**
   * Formats a raw message string using the configured message formatter
   *
   * @param message - The raw message string to format
   * @param data - Optional data object for message interpolation
   * @returns The formatted message string
   *
   * @example
   * ```typescript
   * const formatted = i18n.formatRawMessage('Hello {name}!', { name: 'John' })
   * console.log(formatted) // "Hello John!"
   * ```
   */
  formatRawMessage(message: string, data?: Record<string, any>): string {
    return this.#i18nManager.getFormatter().format(message, this.locale, data)
  }
}
