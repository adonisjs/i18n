/*
 * @adonisjs/i18n
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { extname, resolve } from 'node:path'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { HttpContext } from '@adonisjs/core/http'

import type { FsLoader } from './loaders/fs.ts'

const MIME_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
}

function decodeLocation(location: string): string {
  try {
    return decodeURIComponent(location)
  } catch {
    return location
  }
}

export function createFileServer(loader: FsLoader) {
  const location = loader.serveFiles?.location

  if (!location) {
    throw new Error('Cannot create file server without a serveFiles-enabled fs loader')
  }

  const basePath = location instanceof URL ? fileURLToPath(location) : location
  const resolvedBasePath = resolve(basePath)

  return async function ({ request, response }: HttpContext) {
    const requestedLocation = decodeLocation(request.param('*').join('/'))
    const absoluteFilePath = resolve(resolvedBasePath, requestedLocation)
    const extension = extname(absoluteFilePath)

    if (!MIME_TYPES[extension]) {
      response.status(404)
      response.send('File not found')
      return
    }

    if (
      absoluteFilePath !== resolvedBasePath &&
      !absoluteFilePath.startsWith(`${resolvedBasePath}/`)
    ) {
      response.status(403)
      response.send('Access denied')
      return
    }

    try {
      const stats = await stat(absoluteFilePath)
      if (!stats.isFile()) {
        response.status(404)
        response.send('File not found')
        return
      }

      response.type(MIME_TYPES[extension])
      response.header('Content-length', stats.size.toString())
      return response.stream(createReadStream(absoluteFilePath))
    } catch {
      response.status(404)
      response.send('File not found')
      return
    }
  }
}
