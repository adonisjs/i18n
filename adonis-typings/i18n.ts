/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/I18n' {
  import { DateTime } from 'luxon'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  /**
   * Data object for missing translation event
   */
  export type MissingTranslationEventData = {
    locale: string
    identifier: string
    hasFallback: boolean
  }

  /**
   * Wildcard callback for the validator messages
   */
  export type ValidatorWildcardCallback = (
    field: string,
    rule: string,
    arrayExpressionPointer?: string,
    args?: any
  ) => string

  /**
   * Number formatting options
   */
  export type NumberFormatOptions = Intl.NumberFormatOptions & {
    style?: 'decimal' | 'currency' | 'percent' | 'unit'
    unitDisplay?: 'long' | 'short' | 'narrow'
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero'
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
    localeMatcher?: 'best fit' | 'lookup'
    currencySign?: 'accounting' | 'standard'
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
    compactDisplay?: 'short' | 'long'
  }

  /**
   * Formatting options for the currency formatter. It is
   * a subset of the number formatter
   */
  export type CurrencyFormatOptions = Omit<
    NumberFormatOptions,
    'style' | 'unit' | 'unitDisplay'
  > & {
    // Currency is always required
    currency: string
  }

  /**
   * Formatting options for the time formatter. It is
   * a subset of the date formatter
   */
  export type TimeFormatOptions = Omit<
    Intl.DateTimeFormatOptions,
    'dateStyle' | 'weekday' | 'era' | 'year' | 'month' | 'day' | 'timeZoneName'
  >

  /**
   * Shape of translations
   */
  export type Translations = {
    [lang: string]: Record<string, string>
  }

  /**
   * The loader only needs a single method to load the
   * translations
   */
  export interface LoaderContract {
    load(): Promise<Translations>
  }

  /**
   * Translations formatter formats a string as per the defined
   * specification.
   */
  export interface TranslationsFormatterContract {
    readonly name: string

    /**
     * Formats a message for the current locale
     */
    format(message: string, locale: string, data?: Record<string, any>): string
  }

  /**
   * Shape of the formatter. A given formatter always works with a single
   * locale.
   */
  export interface FormatterContract {
    /**
     * The locale the formatter is working with
     */
    locale: string

    /**
     * Formats a numeric value
     */
    formatNumber(value: string | number | bigint, options?: NumberFormatOptions): string

    /**
     * Formats a numeric value to a currency display value
     */
    formatCurrency(value: string | number | bigint, options: CurrencyFormatOptions): string

    /**
     * Formats date, luxon date, ISO date/time string or a timestamp to
     * a formatted date-time string
     */
    formatDate(
      value: string | number | Date | DateTime,
      options?: Intl.DateTimeFormatOptions
    ): string

    /**
     * Formats date, luxon date, ISO date/time string or a timestamp to
     * a formatted time string
     */
    formatTime(value: string | number | Date | DateTime, options?: TimeFormatOptions): string

    /**
     * Format a date, luxon date, ISO date/time string or a diff value
     * to a relative difference string
     */
    formatRelativeTime(
      value: string | number | Date | DateTime,
      unit: Intl.RelativeTimeFormatUnit | 'auto',
      options?: Intl.RelativeTimeFormatOptions
    ): string

    /**
     * Format the value to its plural counter part
     */
    formatPlural(value: string | number, options?: Intl.PluralRulesOptions): string
  }

  /**
   * Config options accepted by the FS loader
   */
  export type FsLoaderOptions = {
    location: string
  }

  /**
   * Config for I18n
   */
  export type I18nConfig = {
    /**
     * Translations format to use. Officially we support
     * ICU only
     */
    translationsFormat: string

    /**
     * Default locale for the application. This locale is
     * used when request locale doesn't fall into the
     * supportLocales list
     */
    defaultLocale: string

    /**
     * If not defined, we will rely on the translations to find the
     * support locales
     */
    supportedLocales?: string[]

    /**
     * A custom object of locales and their fallbacks
     */
    fallbackLocales?: Record<string, string>

    /**
     * Set this to true when you want to use i18n for defining
     * validator messages.
     */
    provideValidatorMessages: boolean

    /**
     * Add this function if you want to have control over what is returned
     * when an identifier is missing.
     */
    fallback?: (identifier: string, locale: string) => string

    /**
     * Configured loaders
     */
    loaders: {
      fs?: {
        enabled: boolean
      } & FsLoaderOptions
    } & Record<string, { enabled: boolean } & Record<any, any>>
  }

  /**
   * I18n class works with a dedicated locale at a given point
   * in time
   */
  export interface I18nContract extends FormatterContract {
    /**
     * The fallback locale for the current instance.
     */
    readonly fallbackLocale: string

    /**
     * Switch locale for the specific instance
     */
    switchLocale(locale: string): void

    /**
     * Returns a wildcard function to format validation
     * failure messages
     */
    validatorMessages(messagesPrefix?: string): {
      '*': ValidatorWildcardCallback
    }

    /**
     * Returns a boolean identifying if the message for a given
     * identifier exists or not
     */
    hasMessage(identifier: string): boolean

    /**
     * Returns a boolean identifying if a fallback message for a given
     * identifier exists or not
     */
    hasFallbackMessage(identifier: string): boolean

    /**
     * Format a message using its identifier. The message from the
     * fallback language is used when the message from current
     * locale is missing.
     */
    formatMessage(identifier: string, data?: Record<string, any>, fallbackMessage?: string): string

    /**
     * Format a raw message
     */
    formatRawMessage(message: string, data?: Record<string, any>): string
  }

  /**
   * Shape for the loader extend callback
   */
  export type LoaderExtendCallback = (manager: I18nManagerContract, config: any) => LoaderContract

  /**
   * Shape for the translations formatter extend callback
   */
  export type FormatterExtendCallback = (
    manager: I18nManagerContract,
    config: I18nConfig
  ) => TranslationsFormatterContract

  /**
   * I18n manager shape
   */
  export interface I18nManagerContract {
    /**
     * Reference to the config
     */
    config: I18nConfig

    /**
     * Reference to the AdonisJS application
     */
    application: ApplicationContract

    /**
     * Reference to the default locale
     */
    defaultLocale: string

    /**
     * Get instance for a specific locale
     */
    locale(locale: string): I18nContract

    /**
     * Negotiates the user language against the supported
     * locales and returns the best match or null if there
     * is no match.
     */
    getSupportedLocale(userLanguage: string | string[]): string | null

    /**
     * Returns the fallback locale for a given locale. Returns the default
     * locale when no fallback is defined
     */
    getFallbackLocale(locale: string): string

    /**
     * An array of locales for which the application has defined
     * translations. These are user defined locales and not
     * normalized "ISO 15897" strings
     */
    supportedLocales(): string[]

    /**
     * Loads translations using the registered loaders. The method returns
     * in a noop after first call. Use "reloadTranslations" to force
     * reload
     */
    loadTranslations(): Promise<void>

    /**
     * Reloads translations using the registered loaders
     */
    reloadTranslations(): Promise<void>

    /**
     * Returns all the translations
     */
    getTranslations(): Translations

    /**
     * Returns translations for a given locale
     */
    getTranslationsFor(locale: string): Record<string, string>

    /**
     * Returns reference to the application formatter
     */
    getFormatter(): TranslationsFormatterContract

    /**
     * Pretty prints the missing translation message on the console
     */
    prettyPrint: (data: MissingTranslationEventData) => void

    /**
     * Extend to add custom loaders and formatters
     */
    extend(name: string, type: 'loader', callback: LoaderExtendCallback): void
    extend(name: string, type: 'formatter', callback: FormatterExtendCallback): void
    extend(
      name: string,
      type: 'loader' | 'formatter',
      callback: FormatterExtendCallback | LoaderExtendCallback
    ): void
  }

  const I18n: I18nManagerContract
  export default I18n
}
