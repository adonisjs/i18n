/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { EmitterContract } from '@ioc:Adonis/Core/Event'
import { I18nContract, MessageFormatterContract } from '@ioc:Adonis/Addons/I18n'

import { Formatter } from '../Formatters/Core'

/**
 * I18n class works with a dedicated locale at a given point
 * in time
 */
export class I18n extends Formatter implements I18nContract {
  constructor(
    public locale: string,
    private formatter: MessageFormatterContract,
    private emitter: EmitterContract,
    private messages: Record<string, string>,
    private fallbackMessages: Record<string, string>
  ) {
    super(locale)
  }

  /**
   * Switch locale for the current instance
   */
  public switchLocale(locale: string) {
    this.locale = locale
  }

  /**
   * Formats a message using the messages formatter
   */
  public formatMessage(identifier: string, data: Record<string, any>): string {
    let message = this.messages[identifier]

    /**
     * Attempt to read message from the fallback messages
     */
    if (!message) {
      message = this.fallbackMessages[identifier]

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
    return this.formatter.format(message, this.locale, data)
  }
}
