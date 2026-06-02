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
import type { I18n } from './i18n.ts'

/**
 * VineJS messages provider to read validation messages from I18n translations.
 * Provides field name translations and validation error messages with fallback support.
 *
 * @example
 * ```typescript
 * const i18n = new I18n('en', emitter, manager)
 * const provider = new I18nMessagesProvider('validation', i18n)
 * const message = provider.getMessage('The field is required', 'required', field)
 * ```
 */
export class I18nMessagesProvider implements MessagesProviderContact {
  /**
   * The validation messages prefix to use when reading translations.
   * Used to construct translation keys for validation error messages.
   */
  #messagesPrefix: string

  /**
   * The validation fields prefix to use when reading translations.
   * Used to construct translation keys for field name translations.
   */
  #fieldsPrefix: string

  /**
   * Reference to I18n instance for formatting messages and resolving translations
   */
  #i18n: I18n

  /**
   * Creates a new I18nMessagesProvider instance
   *
   * @param prefix - The base prefix for translation keys (e.g., 'validation')
   * @param i18n - The I18n instance to use for message formatting and translation
   */
  constructor(prefix: string, i18n: I18n) {
    this.#fieldsPrefix = `${prefix}.fields`
    this.#messagesPrefix = `${prefix}.messages`
    this.#i18n = i18n
  }

  /**
   * Retrieves and formats a validation message with field-specific and rule-specific fallbacks
   *
   * Message resolution priority:
   * 1. Field-specific message: `{prefix}.messages.{fieldPath}.{rule}`
   * 2. Rule-specific message: `{prefix}.messages.{rule}`
   * 3. Default message with interpolation
   *
   * @param defaultMessage - The default validation message to use as final fallback
   * @param rule - The validation rule name (e.g., 'required', 'email')
   * @param field - The field context containing name and path information
   * @param meta - Optional metadata for message interpolation (e.g., otherField, min, max)
   * @returns Formatted validation message string
   *
   * @example
   * ```typescript
   * const message = provider.getMessage(
   *   'The field is required',
   *   'required',
   *   { name: 'email', wildCardPath: 'user.email' },
   *   { min: 5 }
   * )
   * ```
   */
  getMessage(
    defaultMessage: string,
    rule: string,
    field: FieldContext,
    meta?: Record<string, any>
  ) {
    /**
     * Translating field names
     */
    const fieldName = this.translateField(field.name)
    if (meta?.otherField) meta.otherField = this.translateField(meta.otherField)
    if (meta?.originalField) meta.originalField = this.translateField(meta.originalField)

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

  /**
   * Translates a field name using the configured prefix.
   */
  translateField(name: string | number) {
    const translatedFieldName = this.#i18n.resolveIdentifier(`${this.#fieldsPrefix}.${name}`)
    if (translatedFieldName) {
      return this.#i18n.formatRawMessage(translatedFieldName.message)
    }
    return name
  }
}
