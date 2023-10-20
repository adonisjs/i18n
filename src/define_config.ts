/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import { RuntimeException } from '@poppinss/utils'
import type { ConfigProvider } from '@adonisjs/core/types'

import type {
  LoaderFactory,
  BaseI18nConfig,
  FormatterFactory,
  I18nManagerConfig,
  FsLoaderOptions,
} from './types/main.js'

/**
 * Config helper to define i18n config
 */
export function defineConfig(
  config: Partial<BaseI18nConfig> & {
    formatter: FormatterFactory | ConfigProvider<FormatterFactory>
    loaders: (ConfigProvider<LoaderFactory> | LoaderFactory)[]
  }
): ConfigProvider<I18nManagerConfig> {
  if (!config.formatter) {
    throw new RuntimeException('Cannot configure i18n manager. Missing property "formatter"')
  }

  const { formatter, loaders, ...rest } = config

  return configProvider.create(async (app) => {
    /**
     * Resolving formatter
     */
    const resolvedFormatter =
      typeof formatter === 'function' ? formatter : await formatter.resolver(app)

    /**
     * Resolving loaders. Each loader can be a factory or a
     * config provider.
     */
    const resolvedLoaders = await Promise.all(
      loaders.map((loader) => {
        return typeof loader === 'function' ? loader : loader.resolver(app)
      })
    )

    return {
      defaultLocale: 'en',
      formatter: resolvedFormatter,
      loaders: resolvedLoaders,
      ...rest,
    } satisfies I18nManagerConfig
  })
}

/**
 * Config helper to configure a formatter for i18n
 */
export const formatters: {
  icu: () => ConfigProvider<FormatterFactory>
} = {
  icu() {
    return configProvider.create(async () => {
      const { IcuFormatter } = await import('../src/messages_formatters/icu.js')
      return () => new IcuFormatter()
    })
  },
}

/**
 * Config helper to configure loaders for i18n
 */
export const loaders: {
  fs: (config: FsLoaderOptions) => ConfigProvider<LoaderFactory>
} = {
  fs(config) {
    return configProvider.create(async () => {
      const { FsLoader } = await import('../src/loaders/fs.js')
      return () => new FsLoader(config)
    })
  },
}
