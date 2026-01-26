# orders.web.ch.gov.uk

### Overview

The aim of this template is to give you a head start in setting up a new web application for Companies House.

The template uses [Express](https://expressjs.com), [TypeScript](https://typescriptlang.org) and the [GovUK Frontend](https://github.com/alphagov/govuk-frontend) toolkit to set up a simple example of a web application that runs on NodeJS.

**You can create a new project from this template by clicking the [Use this template](https://github.com/companieshouse/node-web-starter/generate) button.**

## Contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Running the server](#running-the-server)
- [Static assets](#static-assets)
- [Compiling the application](#compiling-the-application)
- [Linting](#linting)
- [Testing](#testing)

### Quick start

If you are familiar with NodeJS development and already have it installed, simply run the `init` make task

    make init
    
And then start the application
    
    npm start
    
Then go to [http://localhost:3000](http://localhost:3000).

### Prerequisites

You are going to need a few things to begin. Firstly, NodeJS. There are a few ways to install it.

- [Official installer](https://nodejs.org/en/)
- [Node Version Manager](https://github.com/nvm-sh/nvm)
- [Homebrew](https://formulae.brew.sh/formula/node)

Node version manager allows you to install multiple versions side by side on the host machine.
    
### Running the server

There are two ways to run the server in development. You run it in normal mode;

    npm start
    
Or, automatically reload the server once you make changes to source code;

    npm start:watch

### Compiling the application

TypeScript compiles down the JavaScript code that eventually gets run via NodeJS. The `build` npm task will write the JavaScript to the [dist](./dist) folder.

    npm run build
    
**It is this code that gets run in production.**

### Linting

[TSLint](https://palantir.github.io/tslint/) is used to perform static analysis on code style.

    npm run lint

### Testing

Tests can be found in the directory [src/test](./src/test). The framework used is [Jest](https://jestjs.io) along with [Supertest](https://github.com/visionmedia/supertest) to dispatch handlers that can have assertions made against the responses. Execute the following to run the tests;

    npm t

### Health check endpoint

| Path                                | Method | Description                                                         |
|-------------------------------------|--------|---------------------------------------------------------------------|
| *`/orders-web/health`* | GET    | Returns HTTP OK (`200`) to indicate a healthy application instance. |

#### Health check implementation note

* The healthcheck endpoint uses the [`express-actuator`](https://www.npmjs.com/package/express-actuator?activeTab=readme)
package. This means the app also provides `/orders-web/info` and `/orders-web/metrics`
endpoints. These should probably not be exposed.

## Configurable banner

The application has a configurable notification banner that can be shown at the top of Basket page.
It is controlled by four environment variables:

- **CONFIGURABLE_BANNER_ENABLED** - Set to `true` to show the banner (default: `false`).
- **CONFIGURABLE_BANNER_TITLE** - The banner heading (rendered as an H3 with class `govuk-notification-banner__heading`).
- **CONFIGURABLE_BANNER_TEXT** - The banner body. Use Markdown style links: `[text](https://example.com)`.

- **CONFIGURABLE_BANNER_OTHER_TEXT** - The banner body text shown a line below the CONFIGURABLE_BANNER_TEXT.`[text]`.

**Please note that all four variables must be set for the banner to be displayed.**

For example:

```bash
export CONFIGURABLE_BANNER_ENABLED=true
export CONFIGURABLE_BANNER_TITLE="From 1st February 2026, some of our fees will be changing."
export CONFIGURABLE_BANNER_TEXT="We've published a full list of Companies House fees that are changing from 1 February 2026. [View the fees](https://example.com/fees)"
export CONFIGURABLE_BANNER_OTHER_TEXT="Any item(s) in your basket paid for from this date will be charged at the new price."
```

#### Link (Markdown) support

- Only Markdown style links are parsed in `CONFIGURABLE_BANNER_TEXT`. Use the format: `[link text](https://example.com)`.
- Multiple links are supported in the same string and will be converted to HTML anchor tags with the `govuk-link` class.
- The link parser handles URLs containing parentheses in common cases (for example `https://example.com/path(foo)`), but very complex nested parentheses inside URLs should be encoded.
- Raw URLs (plain `https://example.com` without Markdown formatting) will not be auto converted.

#### Banner precedence and behaviour

Only one banner or error is shown at a time on the certificate start page in line with GDS standards. The visible message follows this priority (highest first):

1. Basket error (red error summary) - shown when the basket maximum has been reached and the user attempts to click "Start now" button. This error supersedes any notification banner.
2. Configurable banner - shown when `CONFIGURABLE_BANNER_ENABLED`, `CONFIGURABLE_BANNER_TITLE`, `CONFIGURABLE_BANNER_TEXT` and `CONFIGURABLE_BANNER_OTHER_TEXT` are all set. This banner takes precedence over the full basket informational banner.
3. Basket full informational banner - shown when the basket is at or above the display limit but the red basket error condition is not currently triggered.