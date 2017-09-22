'use strict'

/*
 * adonis-antl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')

/**
 * Copies the sample schema file to the migrations directory
 *
 * @method copySchemaFile
 *
 * @param  {Object}       cli
 *
 * @return {void}
 */
async function copySchemaFile (cli) {
  try {
    const fileName = `${new Date().getTime()}_locales.js`
    await cli.command.copy(
      path.join(__dirname, './templates/locales-schema.js'),
      cli.helpers.migrationsPath(fileName)
    )
    cli.command.completed('create', `database/migrations/${fileName}`)
  } catch (error) {
    // ignore error
  }
}

/**
 * Creates the locales directory inside `resources` directory
 *
 * @method createLocalesDir
 *
 * @param  {Object}         cli
 *
 * @return {void}
 */
async function createLocalesDir (cli) {
  try {
    await cli.command.ensureDir(cli.helpers.resourcesPath('locales'))
    cli.command.completed('create', 'resources/locales')
  } catch (error) {
    // ignore the error
  }
}

module.exports = async function (cli) {
  const loader = await cli.command.choice('Select from where to load the locales messages from', [
    {
      name: 'Database table',
      value: 'database'
    },
    {
      name: 'Filesystem (locales directory)',
      value: 'file'
    }
  ])

  if (loader === 'database') {
    await copySchemaFile(cli)
  } else {
    await createLocalesDir(cli)
  }
}
