# eslint-plugin-import-issue-1

### General Pre-requisites

-   Make sure you have [Node.js](https://nodejs.org/en/download/) `v22.6.0` installed (we recommend using [NVM](https://github.com/nvm-sh/nvm)).
-   Modern Yarn requires [corepack](https://nodejs.org/api/corepack.html) to be enabled. To enable corepack, it is sufficient to run `corepack enable` once (requires Node.js).
    You might need to enable corepack again every time you update Node.js (especially if you use NVM).
-   We use [GIT LFS](https://git-lfs.com/) to store large binary files. Make sure you have it installed and configured. You might need to run `git lfs install` once.
-   Initialize the project running `yarn`.

### The Issue

***(Please note that `eslint-import-resolver-exports` has been patched in this project to provide some logs)***

1. Run `yarn lint:ok`
2. Linting is completed successfully
3. Run `yarn lint:not-ok`
4. Linting fails with the following error:
```text
Oops! Something went wrong! :(

ESLint: 8.57.1

TypeError: Cannot read properties of null (reading '/Users/username/repositories/eslint-plugin-import-issue-1/src/not-ok.js')
Occurred while linting /Users/username/repositories/eslint-plugin-import-issue-1/src/not-ok.js:1
Rule: "import/no-cycle"
    at checkSourceValue (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint-plugin-import/lib/rules/no-cycle.js:116:59)
    at checkSourceValue (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint-module-utils/moduleVisitor.js:32:5)
    at checkSource (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint-module-utils/moduleVisitor.js:38:5)
    at ruleErrorHandler (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/linter.js:1076:28)
    at /Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/safe-emitter.js:45:58
    at Array.forEach (<anonymous>)
    at Object.emit (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/safe-emitter.js:45:38)
    at NodeEventGenerator.applySelector (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/node-event-generator.js:297:26)
    at NodeEventGenerator.applySelectors (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/node-event-generator.js:326:22)
    at NodeEventGenerator.enterNode (/Users/username/repositories/eslint-plugin-import-issue-1/node_modules/eslint/lib/linter/node-event-generator.js:340:14)
```

### The Details
- `yarn lint:ok` lints `./src/ok.js` file with the following content:
```js
import {default as inquirer} from 'inquirer';
```
- `yarn lint:not-ok` lints `./src/not-ok.js` file with the following content:
```js
import {default as figures} from 'figures';
```
- `inquirer` has the following relevant `package.json` fields:
```json
{
    "type": "module",
    "exports": {
        "./package.json": "./package.json",
        ".": {
            "import": {
                "types": "./dist/esm/index.d.ts",
                "default": "./dist/esm/index.js"
            },
            "require": {
                "types": "./dist/commonjs/index.d.ts",
                "default": "./dist/commonjs/index.js"
            }
        }
    },
    "main": "./dist/commonjs/index.js",
    "module": "./dist/esm/index.js",
    "types": "./dist/commonjs/index.d.ts"
}
```
- `figures` has the following relevant `package.json` fields:
```json
{
    "type": "module",
    "exports": {
        "types": "./index.d.ts",
        "default": "./index.js"
    }
}
```
- The important main difference is that `inquirer` is a hybrid package with both ESM and CJS entry points, whether `figures` is ESM only.
- Using the following settings, we make so that `require` condition is preferred over `import` condition:
```json
{
    "import/resolver": {
        "exports": {
            "require": true
        }
    }
}
```
- So, `inquirer` is loaded in CJS format, while `figures` is loaded in ESM, which is what is making ESLint crash. **In fact, if we go into the `index.js` of `figures` and remove all ESM import/export statements, the issue goes away**.
- So, it would seem that ESM is supported in project files, but not inside `node_modules` files, but the strange things are:

  - If we remove `eslint-import-resolver-exports` from the settings, the issue goes away, even if the resolver is doing its job flawlessly (see logs). But we loose support for `exports`.
  - The issue seems to not be present when using `eslint-import-resolver-typescript`.
  - It is like if `eslint-import-resolver-exports` was missing something in the returned data or something.

**Finally, the most strange thing to me is that if we tweak `eslint-import-resolver-exports` to skip external modules, or just `figures` in this case, the issue also goes away.**

**Also, the following makes the issue go away**:

```json
{
    "import/no-cycle": [
        "error",
        {
            "ignoreExternal": true
        }
    ]
}
```

(even if, as a side effect, `ignoreExternal` seems to increase linting time instead of reducing it as I would have expected)

So, is `import/no-cycle` really checking external modules? Or it is just working because the external files are not being resolved in most cases?

Is it an issue with `eslint-import-resolver-exports`?

I am available to work on this (I already adopted `eslint-import-resolver-exports` and will publish an updated version of it in the future).
