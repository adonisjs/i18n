module.exports = {
  locales: {
    /*
    |--------------------------------------------------------------------------
    | Driver
    |--------------------------------------------------------------------------
    |
    | The driver to be used for loading locale strings. All locales are loaded
    | once and then cached in memory. Below is the list of available drivers.
    |
    | file, database
    |
    */
    driver: 'file',

    /*
    |--------------------------------------------------------------------------
    | Default Locales
    |--------------------------------------------------------------------------
    |
    | The default active locale to be used for formatting messages.
    |
    */
    locale: 'en',

    /*
    |--------------------------------------------------------------------------
    | Fallback Locale
    |--------------------------------------------------------------------------
    |
    | Fallback locale to be used for formatting messages when the currently
    | active locale cannot be translated.
    |
    */
    fallbackLocale: 'en',

    /*
    |--------------------------------------------------------------------------
    | Locale Matcher
    |--------------------------------------------------------------------------
    |
    | How to match locale formats. The available formats are:
    |
    | lookup, best fit
    |
    */
    localeMatcher: 'best fit'
  }
}
