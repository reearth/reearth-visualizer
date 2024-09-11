# Playwright E2E Testing Project

## Project Overview

This project is an end-to-end (E2E) testing suite built using [Playwright](https://playwright.dev/). It follows the Page Object Model (POM) design pattern to organize tests for various components of the `visualizer` module, including `dashboard`, `projectSetting`, and `scene`.

## Project Structure

web
├── e2e
│ ├── pom
│ │ ├── visualizer
│ │ │ ├── dashboard
│ │ │ │ ├── index.ts
│ │ │ │ └── ProjectsPage.ts
│ │ │ ├── projectSetting
│ │ │ │ ├── generalPage.ts
│ │ │ │ └── index.ts
│ │ │ ├── scene
│ │ │ │ ├── index.ts
│ │ │ │ └── MapPage.ts
│ │ └── index.ts
│ ├── test.spec.ts-snapshots
│ │ ├── expect-chromium-darwin.png
│ │ ├── result-chromium-darwin.png
│ │ └── test-chromium-darwin.png
│ ├── utils
│ │ ├── .auth
│ │ ├── config.ts //old setting
│ │ ├── index.ts //old setting
│ │ ├── login.ts //old setting
│ │ ├── setup.ts //old setting
│ │ └── auth.setup.ts
│ ├── dashboard.spec.ts //old testing
│ └── test.spec.ts //testing file
└── README.md

## Prerequisites

- [Node.js](https://nodejs.org/) >= 14.x
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

## Setup

### Install Dependencies

To install the required packages, run the following commands:

```bash
cd web
yarn install
npx playwright install //if needed
```

To set required .env for frontend. Recording following variable.

```bash
# Local backend with Auth0 OSS tenant
REEARTH_WEB_E2E_BASEURL=http://localhost:3000
REEARTH_WEB_E2E_ACCOUNT // your visualizer accounnt
REEARTH_WEB_E2E_ACCOUNT_PASSWORD // your visualizer password
```

## Running Tests

First run api and frontend, And to run all tests:

```bash
yarn e2e
```

## Configuration

- utils/auth.setup.ts

Contains the authentication setup process for the tests. You can define login flows here to ensure tests are executed under authenticated conditions.

## Snapshots

The test.spec.ts-snapshots directory stores visual snapshots, which are used for visual regression testing. Example snapshot files include:

- expect-chromium-darwin.png
- result-chromium-darwin.png
- test-chromium-darwin.png

## Page Object Model (POM)

The project follows the Page Object Model (POM) pattern, where each page is represented as an object. This improves code maintainability and reusability.

Key Directories:

- dashboard: Manages interactions with the dashboard page via ProjectsPage.ts.
- projectSetting: Handles interactions with the project settings page (generalPage.ts).
- scene: Contains methods for the scene page, including MapPage.ts.
