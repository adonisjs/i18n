/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url'
import { join, extname } from 'node:path'
import { flatten } from '@poppinss/utils'
import { readFile } from 'node:fs/promises'
import { fsReadAll } from '@adonisjs/core/helpers'

import debug from '../debug.ts'
import type { FsLoaderOptions, Translations, TranslationsLoaderContract } from '../types.ts'

/**
 * Filesystem loader that reads translation files from disk.
 * Supports JSON, YAML, and YML file formats with nested directory structure
 * for organizing translations by locale and namespace.
 *
 * File structure example:
 * ```
 * lang/
 *   en/
 *     messages.json
 *     validation.yaml
 *   fr/
 *     messages.json
 * ```
 *
 * @example
 * ```typescript
 * const loader = new FsLoader({ location: './lang' })
 * const translations = await loader.load()
 * console.log(translations.en['messages.welcome']) // "Welcome!"
 * ```
 */
export class FsLoader implements TranslationsLoaderContract {
  serveFiles?: {
    routePattern: string
    location: string | URL
  }

  /**
   * Base path for translation files on the filesystem
   * Resolved from URL or string path in the configuration
   */
  #storageBasePath: string

  /**
   * Creates a new FsLoader instance
   *
   * @param config - Configuration object containing the location of translation files
   */
  constructor(config: FsLoaderOptions) {
    this.#storageBasePath =
      config.location instanceof URL ? fileURLToPath(config.location) : config.location

    if (config.serveFiles) {
      const routeBasePath = config.routeBasePath || 'lang'
      this.serveFiles = {
        location: config.location,
        routePattern: `${routeBasePath.replace(/\/$/, '')}/*`,
      }
    }
  }

  /**
   * File extensions supported by the FsLoader
   * Includes JSON and YAML formats for maximum compatibility
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

    const untrimmedContent = await readFile(join(this.#storageBasePath, filePath), 'utf-8')
    const contents = untrimmedContent.trim()
    const messages = this.#parseJSON(filePath, contents)
    this.#processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Wraps JSON.parse to raise exception with the file path when
   * unable to parse JSON
   */
  async #parseYaml(filePath: string, contents: string): Promise<Record<string, any>> {
    try {
      const yaml = await import('yaml')
      return yaml.default.parse(contents)
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        throw new Error(
          'Cannot parse YAML i18n files. Make sure to first install the "yaml" package'
        )
      }

      const offset = error.source?.range?.start
      const stack = error.stack!.split('\n')

      if (offset) {
        stack[0] = `${stack[0]} (at offset ${offset})`
      }

      /**
       * Patching the stack to include the YAML file path
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
    const messages = await this.#parseYaml(filePath, contents)
    this.#processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Returns an array of file paths for translation files
   * Recursively scans the storage directory for supported file types
   *
   * @returns Promise resolving to array of relative file paths
   */
  #getTranslationFiles() {
    return fsReadAll(this.#storageBasePath, {
      filter: (file) => !!this.#supportedFileTypes.find((ext) => file.endsWith(ext)),
      ignoreMissingRoot: true,
    })
  }

  /**
   * Loads all translation messages from the configured directory
   * Processes all supported file types and organizes by locale
   *
   * @returns Promise resolving to translations object organized by locale
   *
   * @example
   * ```typescript
   * const translations = await loader.load()
   * // Returns: { en: { 'hello.world': 'Hello World' }, fr: { 'hello.world': 'Bonjour le monde' } }
   * ```
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
