/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { flatten } from '@poppinss/utils'
import { requireAll } from '@poppinss/utils/build/helpers'
import { FsLoaderOptions, LoaderContract } from '@ioc:Adonis/Addons/I18n'

/**
 * Uses the filesystem to load messages from the JSON
 * files
 */
export class FsLoader implements LoaderContract {
  constructor(private config: FsLoaderOptions) {}

  public async load() {
    const messages =
      requireAll(this.config.location, true, true, (file) => file.endsWith('.json')) || {}

    return Object.keys(messages).reduce((result, lang) => {
      result[lang] = flatten(messages[lang])
      return result
    }, {})
  }
}
