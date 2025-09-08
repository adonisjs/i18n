/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import string from '@adonisjs/core/helpers/string'
import type { FieldContext, MessagesProviderContact } from '@vinejs/vine/types'
import type { I18n } from './i18n.js'

/**
 * VineJS messages provider to read validation messages
 * from translations
 */
export class I18nMessagesProvider implements MessagesProviderContact {
  /**
   * The validation messages prefix to use when reading translations.
   */
  #messagesPrefix: string

  /**
   * The validation fields prefix to use when reading translations.
   */
  #fieldsPrefix: string

  /**
   * Reference to i18n for formatting messages
   */
  #i18n: I18n

  constructor(prefix: string, i18n: I18n) {
    this.#fieldsPrefix = `${prefix}.fields`
    this.#messagesPrefix = `${prefix}.messages`
    this.#i18n = i18n
  }

  getMessage(
    defaultMessage: string,
    rule: string,
    field: FieldContext,
    meta?: Record<string, any>
  ) {
    /**
     * Translating field name
     */
    let fieldName = field.name
    const translatedFieldName = this.#i18n.resolveIdentifier(`${this.#fieldsPrefix}.${field.name}`)
    if (translatedFieldName) {
      fieldName = this.#i18n.formatRawMessage(translatedFieldName.message)
    }
    /**
     * Checking if vine's meta comes with otherField
     */
    if (meta?.otherField) {
      const translatedOtherFieldName = this.#i18n.resolveIdentifier(
        `${this.#fieldsPrefix}.${meta.otherField}`
      )
      if (translatedOtherFieldName) {
        meta.otherField = this.#i18n.formatRawMessage(translatedOtherFieldName.message)
      }
    }

    /**
     * 1st priority is given to the field messages
     */
    const fieldMessage = this.#i18n.resolveIdentifier(
      `${this.#messagesPrefix}.${field.wildCardPath}.${rule}`
    )
    if (fieldMessage) {
      return this.#i18n.formatRawMessage(fieldMessage.message, {
        field: fieldName,
        ...meta,
      })
    }
    /**
     * 2nd priority is for rule messages
     */
    const ruleMessage = this.#i18n.resolveIdentifier(`${this.#messagesPrefix}.${rule}`)
    if (ruleMessage) {
      return this.#i18n.formatRawMessage(ruleMessage.message, {
        field: fieldName,
        ...meta,
      })
    }

    /**
     * Fallback to default message
     */
    return string.interpolate(defaultMessage, {
      field: fieldName,
      ...meta,
    })
  }
}
