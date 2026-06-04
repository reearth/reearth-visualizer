---
title: "Development Commands Reference"
category: "reference"
tags: ["cli", "commands", "development"]
last_updated: "2026-06-04"
related:
  - ../guides/getting-started.md
  - ../setup/1password-setup.md
---

# Development Commands Reference

Complete reference for all development commands available in Re:Earth Visualizer Web.

## Core Development

### `yarn start`

Start the development server.

**Usage**:

```bash
yarn start
```

**What it does**:

- Starts Vite development server
- Opens browser at <http://localhost:3000>
- Enables hot module replacement (HMR)
- Loads environment variables from `.env` and `.env.local`

**Requirements**:

- `.env` file configured (or `.env.local` for overrides)
- Node.js >= 20.11.0

**See also**: [Getting Started Guide](../guides/getting-started.md)

### `yarn start:op`

Start development server with 1Password secrets injection.

**Usage**:

```bash
yarn start:op
```

**What it does**:

- Injects secrets from `.env.op` using 1Password CLI
- Starts Vite development server
- Merges with `.env.local` overrides if present

**Requirements**:

- 1Password CLI installed and configured
- `.env.op` file with 1Password secret references
- Authenticated to 1Password

**See also**: [1Password Setup Guide](../setup/1password-setup.md)

### `yarn build`

Build the application for production.

**Usage**:

```bash
yarn build
```

**What it does**:

- Compiles TypeScript
- Bundles with Vite
- Optimizes assets
- Outputs to `dist/` directory

**Environment**: Uses production environment settings

**Output**: `dist/` directory

### `yarn test`

Run unit tests with Vitest.

**Usage**:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run specific test file
yarn test src/path/to/test.test.ts

# Run tests for specific module
yarn test src/services/config/
```

**What it does**:

- Runs all `*.test.ts` and `*.test.tsx` files
- Uses Vitest test runner
- Includes React Testing Library for component tests

**Configuration**: `vitest.config.ts`

## Code Quality

### `yarn type`

Run TypeScript type checking.

**Usage**:

```bash
yarn type
```

**What it does**:

- Runs `tsc --noEmit` to check types
- Reports type errors without generating output
- Checks entire codebase

**When to use**: Before committing code, in CI/CD

### `yarn lint`

Run ESLint to check code quality.

**Usage**:

```bash
# Lint all files
yarn lint

# Lint specific directory
yarn lint src/app/features/
```

**What it does**:

- Checks code against ESLint rules
- Reports style and quality issues
- Uses `eslint-config-reearth` configuration

**Configuration**: `.eslintrc.js`, `eslint-config-reearth`

### `yarn fix`

Auto-fix ESLint issues.

**Usage**:

```bash
yarn fix
```

**What it does**:

- Runs ESLint with `--fix` flag
- Automatically fixes fixable issues
- Reports issues that require manual fixing

**Note**: Review changes before committing

### `yarn format`

Format code with Prettier.

**Usage**:

```bash
yarn format
```

**What it does**:

- Formats all source files with Prettier
- Applies consistent code style
- Writes changes to files

**Configuration**: `.prettierrc`, `.prettierignore`

### `yarn check`

Run all code quality checks.

**Usage**:

```bash
yarn check
```

**What it does**:

- Runs `yarn type` (TypeScript checking)
- Runs `yarn lint` (ESLint)
- Runs `yarn test` (unit tests)

**When to use**: Before committing, before PRs, in CI/CD

**Exit code**: Non-zero if any check fails

## Tools

### `yarn storybook`

Start Storybook for component development.

**Usage**:

```bash
yarn storybook
```

**What it does**:

- Starts Storybook development server
- Opens browser at <http://localhost:9001>
- Enables component isolation and testing
- Hot reloads on component changes

**When to use**: Developing/testing UI components in isolation

**Configuration**: `.storybook/`

### `yarn gql`

Generate GraphQL types and operations.

**Usage**:

```bash
yarn gql
```

**What it does**:

- Runs GraphQL Code Generator
- Generates TypeScript types from GraphQL schema
- Creates hooks for queries and mutations
- Outputs to `src/services/gql/__gen__/`

**When to run**:

- After modifying GraphQL queries/mutations
- After GraphQL schema changes
- Before committing GraphQL changes

**Configuration**: `codegen.yml`

**See also**: [Working with GraphQL](../guides/working-with-graphql.md)

### `yarn i18n`

Extract i18n strings for translation.

**Usage**:

```bash
yarn i18n
```

**What it does**:

- Extracts translatable strings from source code
- Updates translation files
- Generates i18n resources

**When to run**:

- After adding new UI strings
- Before sending strings for translation
- Before releases

**See also**: [Internationalization](../concepts/internationalization.md)

### `yarn coverage`

Run tests with coverage report.

**Usage**:

```bash
yarn coverage
```

**What it does**:

- Runs all tests with coverage collection
- Generates coverage report
- Outputs HTML report to `coverage/` directory

**Output**: Coverage reports in `coverage/`

**View report**:

```bash
open coverage/index.html
```

## Development Workflows

### Pre-commit Checks

Before committing code:

```bash
yarn check
```

Or run individually:

```bash
yarn type && yarn lint && yarn test
```

### Adding GraphQL Operations

1. Add/modify GraphQL query or mutation
2. Run `yarn gql` to generate types
3. Import and use generated hooks

```bash
# Edit GraphQL file
vim src/services/gql/queries/project.ts

# Generate types
yarn gql

# Verify generation
yarn type
```

### Component Development

1. Start Storybook
2. Develop component in isolation
3. Write tests
4. Run checks

```bash
# Start Storybook
yarn storybook

# In another terminal, run tests in watch mode
yarn test --watch

# Before committing
yarn check
```

### Full Development Cycle

```bash
# 1. Start development server
yarn start:op

# 2. Make changes to code

# 3. If GraphQL changes, generate types
yarn gql

# 4. Run tests
yarn test

# 5. Check code quality
yarn type && yarn lint

# 6. Fix auto-fixable issues
yarn fix

# 7. Format code
yarn format

# 8. Run all checks before commit
yarn check
```

## CI/CD Commands

Commands typically used in continuous integration:

```bash
# Install dependencies
yarn install --frozen-lockfile

# Run all checks
yarn check

# Build for production
yarn build

# Generate coverage for reporting
yarn coverage
```

## Troubleshooting

### `yarn start` fails

**Check**:

- `.env` file exists and is configured
- Node.js version >= 20.11.0
- Ports 3000 is available

**Solution**:

```bash
# Check Node version
node --version

# Check if port is in use
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i :3000)
```

### `yarn start:op` fails

**Check**:

- 1Password CLI installed: `op --version`
- Signed in to 1Password: `op account list`
- `.env.op` file exists with correct references

**See**: [1Password Troubleshooting](../setup/1password-setup.md#troubleshooting)

### `yarn gql` fails

**Check**:

- GraphQL endpoint is accessible
- Schema is valid
- Code generation configuration is correct

**Solution**:

```bash
# Check codegen config
cat codegen.yml

# Run with verbose logging
yarn gql --verbose
```

### `yarn type` reports errors

**Common causes**:

- Forgot to run `yarn gql` after GraphQL changes
- Missing type definitions
- Outdated dependencies

**Solution**:

```bash
# Regenerate GraphQL types
yarn gql

# Install missing types
yarn add -D @types/[package-name]

# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

## All Available Commands

For a complete list of all available commands, see the `scripts` section in `package.json`:

```bash
# View all available commands
yarn run
```

**Main commands**:
- `start`, `start:op` - Development
- `test`, `coverage` - Testing
- `type`, `lint`, `fix`, `format` - Code quality
- `build`, `build:preview` - Building
- `check` - Run all quality checks
- `storybook`, `storybook:build` - Component development
- `gql`, `gql:plateau` - GraphQL code generation
- `i18n` - Internationalization
- `docs:generate`, `docs:validate`, `docs:update-index` - Documentation tools

**Tip**: You can create shell aliases for frequently used commands in your `~/.bashrc` or `~/.zshrc`:

```bash
# Example shell aliases (optional)
alias ys="yarn start"
alias yt="yarn test"
alias yc="yarn check"
```

## Related Documentation

- [Getting Started Guide](../guides/getting-started.md)
- [Environment Variables](./environment-variables.md)
- [Code Conventions](./code-conventions.md)
- [1Password Setup](../setup/1password-setup.md)

## Code References

- `package.json` - All scripts definitions
- `vite.config.ts` - Vite configuration
- `vitest.config.ts` - Test configuration
- `codegen.yml` - GraphQL code generation config

---

**Last Updated**: 2026-06-04
