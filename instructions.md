The package has been configured successfully. Register the following middleware inside the `start/kernel.ts` file to detect the user language.

```ts
// start/kernel.ts

Server.middleware.register([
  // ... other middleware(s)
  () => import('App/Middleware/DetectUserLocale')
])
```

[Click here](https://docs.adonisjs.com/guides/i18n#detecting-user-locale) to read the documentation for detecting user locale.
