/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Options for formatting a numeric value. We override loose
 * types from "Intl.NumberFormatOptions".
 *
 * For example, the type of `style` in "Intl.NumberFormatOptions"
 * is set to string and we overwrite it to a union of allowed
 * values.
 */
export type NumberFormatOptions = Intl.NumberFormatOptions & {
  style?: 'decimal' | 'currency' | 'percent' | 'unit'
  unitDisplay?: 'long' | 'short' | 'narrow'
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero' | 'negative'
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
  localeMatcher?: 'best fit' | 'lookup'
  currencySign?: 'accounting' | 'standard'
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
  compactDisplay?: 'short' | 'long'
  useGrouping?: 'min2' | 'auto' | 'always' | boolean
}

/**
 * Formatting options for the currency formatter. The currency
 * formatter always needs a currency value and disallows
 * "style", "unit", and "unitDisplay" options.
 */
export type CurrencyFormatOptions = Omit<NumberFormatOptions, 'style' | 'unit' | 'unitDisplay'> & {
  // Currency is always required
  currency: string
}

/**
 * Formatting options for the time formatter. It is
 * a subset of the date formatter.
 */
export type TimeFormatOptions = Omit<
  Intl.DateTimeFormatOptions,
  'dateStyle' | 'weekday' | 'era' | 'year' | 'month' | 'day' | 'timeZoneName'
>

/**
 * A translations formatter is responsible for formatting
 * a string based translation to an output value.
 *
 * Custom formatters must implement the following interface
 */
export interface TranslationsFormatterContract {
  readonly name: string

  /**
   * Formats a message for the current locale
   */
  format(message: string, locale: string, data?: Record<string, any>): string
}

/**
 * Shape of translations
 */
export type Translations = {
  [lang: string]: Record<string, string>
}

/**
 * A loader is responsible for loading translations
 */
export interface TranslationsLoaderContract {
  load(): Promise<Translations>
}

/**
 * Config options accepted by the FS loader
 */
export type FsLoaderOptions = {
  location: string | URL
}

/**
 * Base config shared between i18n config and i18n service
 * config
 */
export type BaseI18nConfig = {
  /**
   * Default locale for the application. This locale is
   * used when request locale is not supported by the
   * application
   */
  defaultLocale: string

  /**
   * If not defined, we will rely on the translations to find the
   * supported locales
   */
  supportedLocales?: string[]

  /**
   * A collection of locales with their fallbacks. The fallback
   * locales should be supported by the application
   */
  fallbackLocales?: Record<string, string>

  /**
   * Add this function if you want to have control over what is returned
   * when an identifier is missing.
   */
  fallback?: (identifier: string, locale: string) => string
}

/**
 * Formatter factory is responsible for returning a
 * formatter
 */
export type FormatterFactory = (i18nConfig: I18nManagerConfig) => TranslationsFormatterContract

/**
 * Loader factory is responsible for returning a
 * loader
 */
export type LoaderFactory = (i18nConfig: I18nManagerConfig) => TranslationsLoaderContract

/**
 * Config for the package
 */
export interface I18nManagerConfig extends BaseI18nConfig {
  /**
   * Translations format to use
   */
  formatter: FormatterFactory

  /**
   * Configured loaders for loading translations
   */
  loaders: LoaderFactory[]
}

/**
 * Payload for the missing translation event
 */
export type MissingTranslationEventPayload = {
  locale: string
  identifier: string
  hasFallback: boolean
}
