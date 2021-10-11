/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { language } from '../src/Negotiator'

test.group('Negotiator | language', () => {
  test('negotiate for matching language', (assert) => {
    assert.equal(language(['en_US', 'en'], ['en', 'en_UK', 'en_US']), 'en_US')
  })

  test('negotiate for closest one when no match found', (assert) => {
    assert.equal(language(['en_US', 'en'], ['en', 'en_UK']), 'en')
  })

  test('return null when no match found', (assert) => {
    assert.equal(language(['fr', 'it'], ['en', 'en_UK']), null)
  })
})
