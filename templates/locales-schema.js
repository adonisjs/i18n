'use strict'

const Schema = use('Schema')

class LocaleSchema extends Schema {
  up () {
    this.create('locales', table => {
      table.increments()
      table.string('locale').notNullable()
      table.string('group').notNullable()
      table.string('item').notNullable()
      table.text('text', 'longtext')
      table.timestamps()
    })
  }

  down () {
    this.drop('locales')
  }
}

module.exports = LocaleSchema
