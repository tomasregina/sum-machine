# Tests

All tools need tests. Test each component and cover all functionality.

## Testing Packages

### @open-wc/testing

We use @open-wc/testing, an opinionated package that combines and configures testing libraries to minimize the amount of ceremony required when writing tests.

https://open-wc.org/docs/testing/testing-package/

See https://open-wc.org/docs/testing/helpers/ for all available testing helpers.

### Chai

Chai assertion library is used to write assertions.\
https://open-wc.org/docs/testing/testing-package/#chai

We mainly use chai-dom for dom testing.\
https://www.chaijs.com/plugins/chai-dom/

## Run tests

To run all tests

```
yarn test
```

We advice to run tests in watch mode for easier development. It reloads on file changes.

```
yarn test:watch
```

### File convention

All files, saved in folder `test\` with `*.tests.js` extension, will be included.

## Example code

See `packages/hundred-days/tests` for inspiration.
