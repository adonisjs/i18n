/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Returns absolute path to the stub relative from the templates
 * directory
 */
function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

/**
 * Create the middleware
 */
function makeMiddleware(projectRoot: string, app: ApplicationContract, sink: typeof sinkStatic) {
  const middlewareDirectory = app.resolveNamespaceDirectory('middleware') || 'app/Middleware'
  const middlewarePath = join(middlewareDirectory, 'DetectUserLocale.ts')

  const middlewareTemplate = new sink.files.MustacheFile(
    projectRoot,
    middlewarePath,
    getStub('DetectUserLocale.txt')
  )

  if (middlewareTemplate.exists()) {
    sink.logger.action('create').skipped(`${middlewarePath} file already exists`)
  } else {
    middlewareTemplate.apply({}).commit()
    sink.logger.action('create').succeeded(middlewarePath)
  }
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  makeMiddleware(projectRoot, app, sink)

  if (!existsSync(app.resourcesPath('lang'))) {
    mkdirSync(app.resourcesPath('lang'), { recursive: true })
    const resourceDir = app.directoriesMap.get('resources') || 'resources'
    sink.logger.action('create').succeeded(`./${resourceDir}/lang`)
  }
}
