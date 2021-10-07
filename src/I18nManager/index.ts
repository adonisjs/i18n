/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Exception } from '@poppinss/utils'
import { EmitterContract } from '@ioc:Adonis/Core/Event'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import {
  I18nConfig,
  LoaderContract,
  FsLoaderOptions,
  I18nManagerContract,
  LoaderExtendCallback,
  FormatterExtendCallback,
  MessageFormatterContract,
} from '@ioc:Adonis/Addons/I18n'

import { I18n } from '../I18n'
import { FsLoader } from '../Loaders/Fs'
import { IcuMessageFormatter } from '../Formatters/Message/Icu'

export class I18nManager implements I18nManagerContract {
  /**
   * A set of formatters added from outside in
   */
  private extendedFormatters: Map<string, FormatterExtendCallback> = new Map()

  /**
   * A set of loaders added from outside in
   */
  private extendedLoaders: Map<string, LoaderExtendCallback> = new Map()

  /**
   * Reference to the formatter used by the user application. We initialize
   * it lazily and then cache it.
   */
  private formatter: MessageFormatterContract

  /**
   * Messages fetched using the registered loaders. We load them when "loadMessages"
   * or "reloadMessages" is called.
   */
  private messages: { [lang: string]: Record<string, string> } = {}

  /**
   * Find if messages has been loaded atleast once or not
   */
  private loadedMessages: boolean = false

  /**
   * Reference to the default locale defined inside the config file
   */
  public defaultLocale = this.config.defaultLocale

  /**
   * An array of locales the app supports by inspecting the
   * translation messages
   */
  private supportLocalesViaMessages: string[] = [this.defaultLocale]

  constructor(
    public application: ApplicationContract,
    private emitter: EmitterContract,
    private config: I18nConfig
  ) {
    this.validateConfig()
  }

  /**
   * Validate top level config values to be available when
   * instantiating the manager class
   */
  private validateConfig() {
    if (!this.config) {
      throw new Exception('Missing i18n config. Make sure define it inside "config/i18n.ts" file')
    }

    if (!this.config.loaders) {
      throw new Exception('Missing "loaders" config inside "config/i18n.ts" file')
    }

    if (!this.config.defaultLocale) {
      throw new Exception('Missing "defaultLocale" value inside "config/i18n.ts" file')
    }

    if (!this.config.messagesFormat) {
      throw new Exception('Missing "messagesFormat" value inside "config/i18n.ts" file')
    }
  }

  /**
   * Creates an instance of the extended formatter
   */
  private createExtendedFormatter(name: string) {
    if (!this.extendedFormatters.has(name)) {
      throw new Exception(`Invalid formatter "${name}"`, 500, 'E_INVALID_INTL_FORMATTER')
    }

    return this.extendedFormatters.get(name)!(this, this.config)
  }

  /**
   * Returns an instance of the Icu formatter
   */
  private createIcuFormatter() {
    return new IcuMessageFormatter()
  }

  /**
   * Creates an instance of the messages formatter based upon whats
   * defined inside the user config
   */
  private getMessagesFormatter(name: string): MessageFormatterContract {
    switch (name) {
      case 'icu':
        return this.createIcuFormatter()
      default:
        return this.createExtendedFormatter(name)
    }
  }

  /**
   * Creates an instance of the extended loader
   */
  private createExtendedLoader(name: string, config: any) {
    if (!this.extendedLoaders.has(name)) {
      throw new Exception(`Invalid loader "${name}"`, 500, 'E_INVALID_INTL_LOADER')
    }

    return this.extendedLoaders.get(name)!(this, config)
  }

  /**
   * Returns an instance of the FS loader
   */
  private createFsLoader(config: FsLoaderOptions) {
    return new FsLoader(config)
  }

  /**
   * Creates an instance of the messages loader based upon whats
   * defined inside the user config
   */
  private getLoader(name: string, config: any): LoaderContract {
    switch (name) {
      case 'fs':
        return this.createFsLoader(config)
      default:
        return this.createExtendedLoader(name, config)
    }
  }

  /**
   * An array of locales supported by the application
   */
  public supportedLocales() {
    return this.config.supportedLocales || this.supportLocalesViaMessages
  }

  /**
   * Load messages using the configured loaders
   */
  public async loadMessages() {
    if (!this.loadedMessages) {
      await this.reloadMessages()
    }
  }

  /**
   * Reload messages from the registered loaders
   */
  public async reloadMessages() {
    const translationsStack = await Promise.all(
      Object.keys(this.config.loaders)
        .filter((loader) => {
          return this.config.loaders[loader]?.enabled
        })
        .map((loader) => {
          return this.getLoader(loader, this.config.loaders[loader]).load()
        })
    )

    /**
     * Set flag to true
     */
    this.loadedMessages = true

    /**
     * Empty the existing messages object
     */
    this.messages = {}

    /**
     * Shallow merge messages from all the loaders
     */
    translationsStack.forEach((translations) => {
      if (!translations) {
        return
      }

      Object.keys(translations).forEach((lang) => {
        if (!this.messages[lang]) {
          this.messages[lang] = {}
          if (lang !== this.defaultLocale) {
            this.supportLocalesViaMessages.push(lang)
          }
        }

        Object.assign(this.messages[lang], translations[lang])
      })
    })
  }

  /**
   * Returns an instance of I18n for a given locale
   */
  public locale(locale: string) {
    this.formatter = this.formatter || this.getMessagesFormatter(this.config.messagesFormat)

    return new I18n(
      locale,
      this.formatter,
      this.emitter,
      this.messages[locale] || {},
      this.messages[this.defaultLocale] || {}
    )
  }

  /**
   * Extend by adding custom formatters and loaders
   */
  public extend(name: string, type: 'loader', callback: LoaderExtendCallback): void
  public extend(name: string, type: 'formatter', callback: FormatterExtendCallback): void
  public extend(
    name: string,
    type: 'loader' | 'formatter',
    callback: FormatterExtendCallback | LoaderExtendCallback
  ): void {
    if (type === 'loader') {
      this.extendedLoaders.set(name, callback as LoaderExtendCallback)
    } else {
      this.extendedFormatters.set(name, callback as FormatterExtendCallback)
    }
  }
}
