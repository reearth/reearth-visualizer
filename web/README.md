# reearth/web

Web interface for Re:Earth GIS software built with React 18 and Vite.

## Getting started

### Development

#### Environment Configuration

**Option 1: Traditional .env File (Default)**

1. Copy `.env.example` to `.env`
2. Fill in your environment variables
3. Consult the development team for the correct environment variables
4. Run `yarn start`

**Option 2: 1Password CLI (Recommended)**

Securely manage secrets without storing them on disk.

1. Install 1Password CLI: <https://developer.1password.com/docs/cli/get-started/>
2. Create 1Password item with environment variables from `.env.example`
3. Create `.env.op` with 1Password secret references
4. Run: `yarn start:op`

See [docs/1password-setup.md](docs/1password-setup.md) for detailed setup instructions.

`yarn start` to start the local server. The interface will open on [http://localhost:3000](http://localhost:3000)

`yarn build` TBC

`yarn format` to lint code

`yarn storybook` to open Storybook for web interface's UI on [http://localhost:9001](http://localhost:9001)

`yarn gql` automatically generates typing of GraphQL operations.

`yarn i18n` parses components to provide internationalisation for texts in supported languages.
