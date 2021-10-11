/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import yaml from 'yaml'
import { readFile } from 'fs'
import { join, extname } from 'path'
import { flatten } from '@poppinss/utils'
import { fsReadAll } from '@poppinss/utils/build/helpers'
import { FsLoaderOptions, LoaderContract } from '@ioc:Adonis/Addons/I18n'

/**
 * Uses the filesystem to load messages from the JSON
 * files
 */
export class FsLoader implements LoaderContract {
  constructor(private config: FsLoaderOptions) {}

  private allowedExtensions = ['.json', '.yaml', '.yml']

  /**
   * Returns the file contents
   */
  private getFileContents(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      readFile(join(this.config.location, filePath), 'utf-8', (error, contents) => {
        if (error) {
          reject(error)
          return
        }
        resolve(contents)
      })
    })
  }

  /**
   * Processes the messages for a given file and writes them to the
   * messages bag.
   *
   * @note: The messagesBag property is mutated internally
   */
  private processFileTranslations(
    filePath: string,
    messages: Record<string, string>,
    messagesBag: Record<string, any>
  ) {
    const [lang, ...nestedPath] = filePath
      .replace(new RegExp(`${extname(filePath)}$`), '')
      .split('/')

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
  private parseJSON(filePath: string, contents: string): Record<string, any> {
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
  private async processJSONFile(filePath: string, messagesBag: Record<string, any>) {
    const contents = await this.getFileContents(filePath)
    const messages = this.parseJSON(filePath, contents)
    this.processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Wraps JSON.parse to raise exception with the file path when
   * unable to parse JSON
   */
  private parseYaml(filePath: string, contents: string): Record<string, any> {
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
  private async processYamlFile(filePath: string, messagesBag: Record<string, any>) {
    const contents = await this.getFileContents(filePath)
    const messages = this.parseYaml(filePath, contents)
    this.processFileTranslations(filePath, messages, messagesBag)
  }

  /**
   * Returns an array of file paths for translation files. Only
   * collects files ending with ".json" and ".yaml"
   */
  private getTranslationFiles() {
    return fsReadAll(
      this.config.location,
      (file) => !!this.allowedExtensions.find((ext) => file.endsWith(ext))
    )
  }

  /**
   * Loads messages from the lang directory
   */
  public async load() {
    const messagesBag = {}

    await Promise.all(
      this.getTranslationFiles().map((file) => {
        if (file.endsWith('.json')) {
          return this.processJSONFile(file, messagesBag)
        } else {
          return this.processYamlFile(file, messagesBag)
        }
      })
    )

    return Object.keys(messagesBag).reduce((result, lang) => {
      result[lang] = flatten(messagesBag[lang])
      return result
    }, {})
  }
}
