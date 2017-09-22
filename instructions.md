## Registering provider

Make sure to register the provider inside `start/app.js` file.

```js
const providers = [
  '@adonisjs/antl/providers/AntlProvider'
]
```


That's all! Now you are ready to use the antl provider.

## Config

The configuration for locales must be saved inside `config/app.js` file, under `locales` key.

```js
module.exports = {

  locales: {
    /*
    |--------------------------------------------------------------------------
    | Loader
    |--------------------------------------------------------------------------
    |
    | The loader to be used for loading locale strings. The inbuilt loaders
    | are `file` and `database`.
    |
    */
    loader: 'file',

    /*
    |--------------------------------------------------------------------------
    | Locale
    |--------------------------------------------------------------------------
    |
    | The default locale to be used when unable to detect the user locale.
    | Or if user locale is not supported.
    |
    */
    locale: 'en'
  }

}
```

## Setup

1. The `file` loader loads the files from `resources/locales` directory.
2. The `database` loader loads the strings from `locales` table.
