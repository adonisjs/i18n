/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'

import loadersList from './loaders/main.js'
import formattersList from './formatters/main.js'
import type { I18nConfig, I18nServiceConfig } from './types/main.js'

/**
 * Define i18n config
 */
export function defineConfig(config: Partial<I18nServiceConfig>): I18nConfig {
  if (!config.formatter) {
    throw new RuntimeException('Cannot configure i18n manager. Missing property "formatter"')
  }

  return {
    defaultLocale: 'en',
    ...config,
    formatter: (i18Config) => formattersList.create(config.formatter!, i18Config),
    loaders: (config.loaders || []).map((loaderConfig) => {
      return (i18nConfig) => loadersList.create(loaderConfig.driver, loaderConfig, i18nConfig)
    }),
  } satisfies I18nConfig
}
