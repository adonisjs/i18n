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
import {
  I18nContract,
  I18nManagerContract,
  ValidatorWildcardCallback,
} from '@ioc:Adonis/Addons/I18n'
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

  constructor(
    public locale: string,
    private emitter: EmitterContract,
    private logger: LoggerContract,
    private i18nManager: I18nManagerContract
  ) {
    super(locale)
  }

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

  /**
   * Returns the message for a given identifier
   */
  private getMessage(identifier: string, emitAlways = true): string | null {
    let message = this.localeTranslations[identifier]
    if (message) {
      return message
    }

    message = this.fallbackTranslations[identifier]

    /**
     * If emit always is true, then we will notify about the
     * missing translation.
     *
     * Otherwise we only notify then the fallback message
     * exists.
     */
    if (emitAlways || !message) {
      this.emitter.emit('i18n:missing:translation', {
        locale: this.locale,
        identifier,
        hasFallback: !!message,
      })
    }

    return message || null
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
   * Returns a wildcard function to format validation
   * failure messages
   */
  public validatorMessages(messagesPrefix: string = 'validator.shared'): {
    '*': ValidatorWildcardCallback
  } {
    return {
      '*': (field, rule, arrayExpressionPointer, options) => {
        this.lazyLoadMessages()

        const fieldRuleMessage = this.getMessage(`${messagesPrefix}.${field}.${rule}`, false)
        const data = { field, rule, options }

        /**
         * The first priority is give to the field + rule message
         */
        if (fieldRuleMessage) {
          return this.formatRawMessage(fieldRuleMessage, data)
        }

        /**
         * If array expression pointer exists, then the 2nd priority
         * is given to the array expression pointer
         */
        if (arrayExpressionPointer) {
          const arrayExpressionPointerMessage = this.getMessage(
            `${messagesPrefix}.${arrayExpressionPointer}.${rule}`,
            false
          )
          if (arrayExpressionPointerMessage) {
            return this.formatRawMessage(arrayExpressionPointerMessage, data)
          }
        }

        /**
         * Find if there is a message for the validation rule
         */
        const ruleMessage = this.getMessage(`${messagesPrefix}.${rule}`, false)
        if (ruleMessage) {
          return this.formatRawMessage(ruleMessage, data)
        }

        /**
         * Otherwise fallback to a standard english string
         */
        return `${rule} validation failed on ${field}`
      },
    }
  }

  /**
   * Formats a message using the messages formatter
   */
  public formatMessage(identifier: string, data?: Record<string, any>): string {
    this.lazyLoadMessages()
    const message = this.getMessage(identifier)

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
  public formatRawMessage(message: string, data?: Record<string, any>): string {
    return this.i18nManager.getFormatter().format(message, this.locale, data)
  }
}
