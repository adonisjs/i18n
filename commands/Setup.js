'use strict'

const Ioc = require('adonis-fold').Ioc
const fs = require('co-fs-extra')
const path = require('path')
const Command = Ioc.use('Adonis/Src/Command')

class Setup extends Command {

  constructor (Helpers) {
    super()
    this.localesDir = Helpers.resourcesPath('locales/*')
    this.supportedDrivers = ['file', 'database']
  }

  /**
   * Signature to be used for running the command
   *
   * @return {String}
   */
  get signature () {
    return 'antl:setup {-d, --driver=@value:Driver for which the setup process should be executed}'
  }

  /**
   * Commands description is displayed on the help
   * screen.
   *
   * @return {String}
   */
  get description () {
    return 'Setup locales directory or database migrations for using AdonisJs internationalization addon'
  }

  /**
   * Initiates the locales/* directory to be
   * used for setting up locales strings.
   *
   * @private
   */
  * _initFileSetup () {
    try {
      yield fs.ensureDir(this.localesDir)
      this.completed('create', 'resources/locales/*')
    } catch (e) {
      this.error(e)
    }
  }

  /**
   * Creates a migration by calling the migrations command
   *
   * @private
   */
  _initDatabaseSetup () {
    try {
      this.run('make:migration', 'create_locales_table', {
        template: path.join(__dirname, './templates/localesSchema.mustache')
      })
    } catch (e) {
      this.error(e)
    }
  }

  /**
   * Method called by ace to the run command and here we
   * create the locales directory or a migrations file
   * based upon the driver passed for setup.
   *
   * @param  {Object} params
   * @param  {Object} options
   */
  * handle (params, options) {
    const driver = options.driver || 'file'

    if (this.supportedDrivers.indexOf(driver) <= -1) {
      this.warn(`Driver ${driver} does not have a setup process`)
      return
    }

    if (driver === 'file') {
      yield this._initFileSetup()
      return
    }

    this._initDatabaseSetup()
  }
}

module.exports = Setup
