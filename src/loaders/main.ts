/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'

import { FsLoader } from './fs_loader.js'
import type { I18nConfig, TranslationsLoadersList } from '../types/main.js'

class LoadersList {
  /**
   * List of registered loaders
   */
  list: Partial<TranslationsLoadersList> = {
    fs: (config) => new FsLoader(config),
  }

  /**
   * Extend loaders collection and add a custom
   * loaders to it.
   */
  extend<Name extends keyof TranslationsLoadersList>(
    name: Name,
    factoryCallback: TranslationsLoadersList[Name]
  ): this {
    this.list[name] = factoryCallback
    return this
  }

  /**
   * Creates the loaders instance with config
   */
  create<Name extends keyof TranslationsLoadersList>(
    name: Name,
    config: Parameters<TranslationsLoadersList[Name]>[0],
    i18nConfig: I18nConfig
  ) {
    const loaderFactory = this.list[name]
    if (!loaderFactory) {
      throw new RuntimeException(
        `Unknown i18n loader "${String(name)}". Make sure the loader is registered`
      )
    }

    return loaderFactory(config as any, i18nConfig)
  }
}

export default new LoadersList()
