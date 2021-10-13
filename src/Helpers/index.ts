/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { MissingTranslationEventData } from '@ioc:Adonis/Addons/I18n'

/**
 * Pretty prints the missing translation message on the console
 */
export function prettyPrint(data: MissingTranslationEventData) {
  const { Colors } = require('@poppinss/colors')
  const colors = new Colors()

  const name = `[ ${colors.yellow('i18n')} ] `
  const highlightedText = `${colors.dim(`${data.locale}, ${data.identifier}`)}`

  console.log(`${name} translation missing: ${highlightedText}`)
}
