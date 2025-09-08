/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import { RuntimeException } from '@adonisjs/core/exceptions'
import type { ConfigProvider } from '@adonisjs/core/types'

import type {
  LoaderFactory,
  BaseI18nConfig,
  FormatterFactory,
  I18nManagerConfig,
  FsLoaderOptions,
} from './types.ts'

/**
 * Config helper function to define I18n manager configuration
 * Creates a configuration provider that resolves formatters and loaders at runtime
 *
 * @param config - Configuration object with formatter, loaders, and other I18n options
 * @returns ConfigProvider that resolves to I18nManagerConfig
 *
 * @example
 * ```typescript
 * const i18nConfig = defineConfig({
 *   defaultLocale: 'en',
 *   formatter: formatters.icu(),
 *   loaders: [loaders.fs({ location: new URL('./lang', import.meta.url) })]
 * })
 * ```
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
 * Config helpers to configure formatters for I18n
 * Provides factory functions for different message formatting strategies
 *
 * @example
 * ```typescript
 * const config = defineConfig({
 *   formatter: formatters.icu(),
 *   // ... other options
 * })
 * ```
 */
export const formatters: {
  icu: () => ConfigProvider<FormatterFactory>
} = {
  /**
   * Creates a configuration provider for ICU MessageFormat formatter
   * Supports advanced formatting with plurals, selections, and custom formats
   *
   * @returns ConfigProvider that resolves to IcuFormatter factory
   */
  icu() {
    return configProvider.create(async () => {
      const { IcuFormatter } = await import('../src/messages_formatters/icu.js')
      return () => new IcuFormatter()
    })
  },
}

/**
 * Config helpers to configure translation loaders for I18n
 * Provides factory functions for different translation data sources
 *
 * @example
 * ```typescript
 * const config = defineConfig({
 *   loaders: [loaders.fs({ location: './lang' })],
 *   // ... other options
 * })
 * ```
 */
export const loaders: {
  fs: (config: FsLoaderOptions) => ConfigProvider<LoaderFactory>
} = {
  /**
   * Creates a configuration provider for filesystem-based translation loader
   * Reads translation files from disk in JSON, YAML, or YML formats
   *
   * @param config - Filesystem loader configuration with file location
   * @returns ConfigProvider that resolves to FsLoader factory
   */
  fs(config) {
    return configProvider.create(async () => {
      const { FsLoader } = await import('../src/loaders/fs.js')
      return () => new FsLoader(config)
    })
  },
}
