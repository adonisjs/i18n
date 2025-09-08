/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Negotiator from 'negotiator'
import type { Emitter } from '@adonisjs/core/events'

import debug from './debug.ts'
import { I18n } from './i18n.ts'
import type {
  I18nManagerConfig,
  TranslationsFormatterContract,
  MissingTranslationEventPayload,
} from './types.ts'

/**
 * I18nManager manages translation loading, locale detection, and I18n instance creation.
 * It handles multiple loaders, fallback locales, and caching of translations.
 *
 * @example
 * ```typescript
 * const manager = new I18nManager(emitter, config)
 * await manager.loadTranslations()
 * const i18n = manager.locale('en')
 * ```
 */
export class I18nManager {
  /**
   * Configuration object for the I18n manager
   * Contains default locale, supported locales, loaders, and formatter settings
   */
  config: I18nManagerConfig

  /**
   * Reference to the emitter for emitting events
   */
  #emitter: Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload } & any>

  /**
   * Reference to the formatter in use
   */
  #formatter?: TranslationsFormatterContract

  /**
   * An array of supported locales inferred from the fallback locales
   * object + the translations directories.
   *
   * The array is only used when the config doesn't have an explicit
   * value.
   */
  #inferredLocales: string[] = []

  /**
   * Cached in-memory translations. The collection is a merged
   * copy of a
   */
  #translations: { [lang: string]: Record<string, string> } = {}

  /**
   * Find if translations has been cached or not
   */
  #hasCachedTranslations: boolean = false

  /**
   * Reference to the default locale defined inside the config file
   * This is the primary locale used when no specific locale is requested
   */
  get defaultLocale(): string {
    return this.config.defaultLocale
  }

  /**
   * Check if the translations has been cached or not.
   * Use "reloadTranslations" method to re-fetch translations
   * @returns True if translations have been loaded and cached
   */
  get hasCachedTranslations(): boolean {
    return this.#hasCachedTranslations
  }

  /**
   * Creates a new I18nManager instance
   *
   * @param emitter - Event emitter for missing translation notifications
   * @param config - Configuration object containing loaders, locales, and formatter
   */
  constructor(
    emitter: Emitter<{ 'i18n:missing:translation': MissingTranslationEventPayload } & any>,
    config: I18nManagerConfig
  ) {
    this.config = config
    this.#emitter = emitter
  }

  /**
   * Returns an array of locales supported by the application.
   *
   * The method returns locales by inspecting the translations,
   * when no explicit supportedLocales are defined inside the
   * config file.
   *
   * @returns Array of supported locale strings
   *
   * @example
   * ```typescript
   * const locales = manager.supportedLocales()
   * console.log(locales) // ['en', 'fr', 'es']
   * ```
   */
  supportedLocales() {
    return this.config.supportedLocales || this.#inferredLocales
  }

  /**
   * Returns an object of cached translations. The object is shared
   * by reference and hence mutations will mutate the original copy
   *
   * @returns Object containing all loaded translations by locale
   *
   * @example
   * ```typescript
   * const translations = manager.getTranslations()
   * console.log(translations.en['hello.world']) // "Hello World"
   * ```
   */
  getTranslations() {
    return this.#translations
  }

  /**
   * Returns an object of translations for a given locale
   *
   * @param locale - The locale to get translations for
   * @returns Object containing translations for the specified locale
   *
   * @example
   * ```typescript
   * const enTranslations = manager.getTranslationsFor('en')
   * console.log(enTranslations['hello.world']) // "Hello World"
   * ```
   */
  getTranslationsFor(locale: string) {
    return this.#translations[locale] || {}
  }

  /**
   * Returns an instance of the translations formatter for the
   * active formatter. Lazily instantiates the formatter on first access.
   *
   * @returns The configured translations formatter instance
   *
   * @example
   * ```typescript
   * const formatter = manager.getFormatter()
   * const formatted = formatter.format('Hello {name}', 'en', { name: 'John' })
   * ```
   */
  getFormatter() {
    /**
     * Lazily computing the formatter since we allow register custom
     * formatters after an instance of manager has been created
     */
    if (!this.#formatter) {
      const formatterFactory = this.config.formatter
      this.#formatter = formatterFactory(this.config)
    }

    return this.#formatter
  }

  /**
   * Load translations using all the configured loaders.
   *
   * The loaded translations are cached forever and you must use
   * "reloadTranslations" method to reload them.
   *
   * @example
   * ```typescript
   * await manager.loadTranslations()
   * console.log('Translations loaded successfully')
   * ```
   */
  async loadTranslations() {
    if (!this.hasCachedTranslations) {
      await this.reloadTranslations()
    }
  }

  /**
   * Reload translations from the registered loaders
   * Clears existing cache and loads fresh translations from all loaders
   *
   * @example
   * ```typescript
   * await manager.reloadTranslations()
   * console.log('Translations reloaded successfully')
   * ```
   */
  async reloadTranslations() {
    debug('loading translations')

    const translationsStack = await Promise.all(
      this.config.loaders.map((loaderFactory) => {
        return loaderFactory(this.config).load()
      })
    )

    /**
     * Set flag to true
     */
    this.#hasCachedTranslations = true

    /**
     * Empty the existing translations object
     */
    this.#translations = {}

    /**
     * Compute inferred locales
     *
     * The inferred locales is the combination of
     *
     * - Default locale
     * - Fallback locales keys
     * - Locales detected from translations
     */
    this.#inferredLocales = [this.defaultLocale].concat(
      this.config.fallbackLocales ? Object.keys(this.config.fallbackLocales) : []
    )

    /**
     * Shallow merge translations from all the loaders
     */
    translationsStack.forEach((translations) => {
      Object.keys(translations).forEach((lang) => {
        /**
         * Collect inferred locales when not defined explicitly
         */
        if (!this.#inferredLocales.includes(lang)) {
          this.#inferredLocales.push(lang)
        }

        /**
         * Initialize language with an empty object
         */
        this.#translations[lang] = this.#translations[lang] || {}
        Object.assign(this.#translations[lang], translations[lang])
      })
    })
  }

  /**
   * Returns the most appropriate supported locale based upon the user
   * languages using content negotiation
   *
   * @param userLanguage - Single language string or array of preferred languages
   * @returns The best matching supported locale or null if no match found
   *
   * @example
   * ```typescript
   * const locale = manager.getSupportedLocaleFor('en-US,fr;q=0.9')
   * console.log(locale) // 'en' (if supported)
   *
   * const localeArray = manager.getSupportedLocaleFor(['fr', 'en'])
   * console.log(localeArray) // 'fr' (if supported)
   * ```
   */
  getSupportedLocaleFor(userLanguage: string | string[]): string | null {
    /**
     * The "accept" package internally reads the "headers['accept-language']"
     * and therefore we do not need a full blown request object.
     *
     * The behavior is verified using tests
     */
    return (
      new Negotiator({
        headers: {
          'accept-language': Array.isArray(userLanguage) ? userLanguage.join(',') : userLanguage,
        },
      }).language(this.supportedLocales()) || null
    )
  }

  /**
   * Returns the fallback locale for a given locale. Returns the default
   * locale when no fallback is defined or no close match is found
   *
   * @param locale - The locale to find a fallback for
   * @returns The fallback locale string
   *
   * @example
   * ```typescript
   * const fallback = manager.getFallbackLocaleFor('en-CA')
   * console.log(fallback) // 'en' (closest match) or defaultLocale
   * ```
   */
  getFallbackLocaleFor(locale: string): string {
    /**
     * Use explicitly defined fallback locale
     */
    if (this.config.fallbackLocales && this.config.fallbackLocales[locale]) {
      return this.config.fallbackLocales[locale]
    }

    /**
     * Find closest matching locale in the supported list
     */
    const closestMatchingLanguages = new Negotiator({
      headers: {
        'accept-language': locale,
      },
    }).languages(this.supportedLocales())

    /**
     * Loop over the list and return the first best match except
     * the input locale
     */
    for (let matchingLocale of closestMatchingLanguages) {
      if (matchingLocale !== locale) {
        return matchingLocale
      }
    }

    /**
     * Return default locale when there is no best match
     */
    return this.defaultLocale
  }

  /**
   * Returns an instance of I18n for a given locale
   * Uses the default locale if none is provided
   *
   * @param locale - Optional locale string, defaults to defaultLocale
   * @returns New I18n instance for the specified locale
   *
   * @example
   * ```typescript
   * const i18n = manager.locale('fr')
   * const message = i18n.t('hello.world')
   *
   * // Uses default locale
   * const defaultI18n = manager.locale()
   * ```
   */
  locale(locale?: string) {
    return new I18n(locale || this.defaultLocale, this.#emitter, this)
  }

  /**
   * Returns the fallback message for an identifier and locale
   * when the "config.fallback" function is defined.
   *
   * @param identifier - The translation identifier
   * @param locale - The locale to get fallback message for
   * @returns Fallback message string or undefined if not configured
   *
   * @example
   * ```typescript
   * const fallback = manager.getFallbackMessage('missing.key', 'en')
   * console.log(fallback) // Custom fallback or undefined
   * ```
   */
  getFallbackMessage(identifier: string, locale: string): string | undefined {
    return this.config.fallback?.(identifier, locale)
  }
}
