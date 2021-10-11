/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import accepts from 'accepts'

/**
 * Negotiations for the supported language
 */
export function language<T extends string>(
  userLanguage: string | string[],
  supportLanguages: T[]
): T | null {
  return (
    accepts({
      headers: {
        'accept-language': Array.isArray(userLanguage) ? userLanguage.join(',') : userLanguage,
      },
    }).language(supportLanguages) || null
  )
}
