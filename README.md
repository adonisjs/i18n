# AdonisJS Internalization

[![Gitter](https://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square)](https://gitter.im/adonisjs/adonis-framework)
[![Trello](https://img.shields.io/badge/TRELLO-%E2%86%92-89609E.svg?style=flat-square)](https://trello.com/b/yzpqCgdl/adonis-for-humans)
[![Version](https://img.shields.io/npm/v/adonis-antl.svg?style=flat-square)](https://www.npmjs.com/package/adonis-antl)
[![Build Status](https://img.shields.io/travis/adonisjs/adonis-antl/master.svg?style=flat-square)](https://travis-ci.org/adonisjs/adonis-antl)
[![Coverage Status](https://img.shields.io/coveralls/adonisjs/adonis-antl/master.svg?style=flat-square)](https://coveralls.io/github/adonisjs/adonis-antl?branch=master)
[![Downloads](https://img.shields.io/npm/dt/adonis-antl.svg?style=flat-square)](https://www.npmjs.com/package/adonis-antl)
[![License](https://img.shields.io/npm/l/adonis-antl.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> :pray: This repository makes it easy to internationalize your AdonisJs applications.

AdonisJs Internalization is an addon to add support for multiple languages. It ships **Views Helpers** to format dates, numbers, string messages and currency.

## Table of Contents
* [Features](#features)
* [Installation](#installation)
* [Config](#config)
* [Usage](#usage)
* [Official Documentation](#official-documentation)


## Features

* Has support for [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) and [ICU Messaging Format](http://userguide.icu-project.org/formatparse/messages)
* Ships with **file** and **database** drivers.
* Ability to extend drivers.
* Formatting for relative time, datetime, currency and numbers.
* Auto detects user locale.
* Support for named formats.

## Installation

Installing AdonisJs Internalization (adonis-antl) is a pretty simple process.

### Npm install

```bash
npm i --save adonis-antl
```

### Setting up provider

Providers are defined inside `bootstrap/app.js` file.

```javascript
const providers = [
  '...',
  'adonis-antl/providers/AntlProvider'
]
```

### Registering Aliases

Aliases are also defined inside `bootstrap/app.js` file.

```javascript
const aliases = {
  Antl: 'Adonis/Addons/Antl',
  Formats: 'Adonis/Addons/AntlFormats'
}
```

That's all and you are good to go.

## Config

Configuration for `adonis-antl` is supposed to be merged inside `config/app.js` file. You can grab the sample configuration from [examples](http://github.com/adonisjs/adonis-antl/examples/config.js)

## Usage

Once the installation process has been completed, you are good to make use of the `Antl` alias inside your app.

## Using Locales

```javascript
const Antl = use('Antl')

Antl.formatAmount('1000', 'USD') // return $1,000.00

// Runtime locale
Antl.for('fr').formatAmount('1000', 'USD') // return 1 000.00 $US
```

## Official Documentation

Read more about drivers, formatting messages and available methods at [official documentation](http://adonisjs.com/docs/internationalization)


## <a name="contribution-guidelines"></a>Contribution Guidelines

In favor of active development we accept contributions for everyone. You can contribute by submitting a bug, creating pull requests or even improving documentation.

You can find a complete guide to be followed strictly before submitting your pull requests in the [Official Documentation](http://adonisjs.com/docs/contributing).
