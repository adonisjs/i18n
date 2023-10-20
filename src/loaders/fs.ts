/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import yaml from 'yaml'
import { fileURLToPath } from 'node:url'
import { join, extname } from 'node:path'
import { readFile } from 'node:fs/promises'
import { flatten, fsReadAll } from '@poppinss/utils'

import debug from '../debug.js'
import type { FsLoaderOptions, Translations, TranslationsLoaderContract } from '../types.js'

/**
 * Uses the filesystem to load messages from the JSON
 * files
 */
export class FsLoader implements TranslationsLoaderContract {
  /**
   * Base path for translation files
   */
  #storageBasePath: string

  constructor(config: FsLoaderOptions) {
    this.#storageBasePath =
      config.location instanceof URL ? fileURLToPath(config.location) : config.location
  }

  /**
   * File types supported by the FsLoader
   */
  #supportedFileTypes = ['.json', '.yaml', '.yml']

  /**
   * Processes the messages for a given file and writes them to the
   * messages bag.
   *
   * @note: The messagesBag property is mutated internally
   */
  #processFileTranslations(
    filePath: string,
    messages: Record<string, string>,
    messagesBag: Record<string, any>
  ) {
    const [lang, ...nestedPath] = filePath
      .replace(new RegExp(`${extname(filePath)}$`), '')
      .split(/\/|\\/g)

    /**
     * Initialize/use the language node
     */
    messagesBag[lang] = messagesBag[lang] || {}

    /**
     * If the file path is not nested, then consider the file
     * messages to belong directly to the language
     */
    if (!nestedPath.length) {
      messagesBag[lang] = messages
      return
    }

    /**
     * Otherwise create a sub node for messages.
     */
    messagesBag[lang][nestedPath.join('.')] = messages
  }

  /**
   * Wraps JSON.parse to raise exception with the file path when
   * unable to parse JSON
   */
  #parseJSON(filePath: string, contents: string): Record<string, any> {
    try {
      return JSON.parse(contents)
    } catch (error) {
      const stack = error.stack!.split('\n')

      /**
       * Patching the stack to include the JSON file path
       */
      stack.splice(1, 0, `    at anonymous (${filePath})`)

      error.stack = stack.join('\n')
      throw error
    }
  }

  /**
   * Processes the message inside a JSON file
   */
  async #processJSONFile(filePath: string, messagesBag: Record<string, any>) {
    debug('loading translations from "%s"', filePath)

    const contents = await readFile(join(this.#storageBasePath, filePath), 'utf-8')
    const messages = this.#parseJSON(filePath, contents)
    this.#processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Wraps JSON.parse to raise exception with the file path when
   * unable to parse JSON
   */
  #parseYaml(filePath: string, contents: string): Record<string, any> {
    try {
      return yaml.parse(contents)
    } catch (error) {
      const offset = error.source?.range?.start
      const stack = error.stack!.split('\n')

      if (offset) {
        stack[0] = `${stack[0]} (at offset ${offset})`
      }

      /**
       * Patching the stack to include the JSON file path
       */
      stack.splice(1, 0, `    at anonymous (${filePath})`)

      error.stack = stack.join('\n')
      throw error
    }
  }

  /**
   * Processes the message inside a YAML file
   */
  async #processYamlFile(filePath: string, messagesBag: Record<string, any>) {
    debug('loading translations from "%s"', filePath)

    const contents = await readFile(join(this.#storageBasePath, filePath), 'utf-8')
    const messages = this.#parseYaml(filePath, contents)
    this.#processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Returns an array of file paths for translation files.
   */
  #getTranslationFiles() {
    return fsReadAll(this.#storageBasePath, {
      filter: (file) => !!this.#supportedFileTypes.find((ext) => file.endsWith(ext)),
      ignoreMissingRoot: true,
    })
  }

  /**
   * Loads messages from the lang directory
   */
  async load() {
    const messagesBag: Translations = {}
    const translationFiles = await this.#getTranslationFiles()

    await Promise.all(
      translationFiles.map((file) => {
        if (file.endsWith('.json')) {
          return this.#processJSONFile(file, messagesBag)
        } else {
          return this.#processYamlFile(file, messagesBag)
        }
      })
    )

    return Object.keys(messagesBag).reduce<Translations>((result, lang) => {
      result[lang] = flatten(messagesBag[lang])
      return result
    }, {})
  }
}
