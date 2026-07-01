---
title: "Getting Started with Re:Earth Visualizer Web"
category: "guide"
tags: ["setup", "getting-started", "development"]
last_updated: "2026-06-04"
related:
  - ../reference/commands.md
  - ../reference/environment-variables.md
  - ../setup/1password-setup.md
---

# Getting Started with Re:Earth Visualizer Web

Quick start guide for setting up your development environment and running Re:Earth Visualizer Web locally.

## Prerequisites

### Required Software

- **Node.js** >= 20.11.0
- **Yarn** 4.6.0 (installed with project)
- **Git** (latest version)

### Optional Software

- **1Password CLI** - For secure environment variable management (recommended)
- **VS Code** - Recommended editor with TypeScript support

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 20.11.0

# Check Git
git --version

# Yarn will be installed automatically via Corepack
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reearth-visualizer/web
```

### 2. Install Dependencies

```bash
# Install all dependencies
yarn install
```

This will:

- Install all npm packages
- Set up Husky git hooks
- Configure Yarn 4.6.0 via Corepack

### 3. Configure Environment Variables

You have two options:

#### Option A: Traditional .env File (Quick Start)

```bash
# Copy example file
cp .env.example .env

# Edit .env and fill in required values
vim .env
```

**Required variables**:

```bash
REEARTH_WEB_API=http://localhost:9000/api
REEARTH_WEB_AUTH_PROVIDER=mock  # Use mock auth for development
```

#### Option B: 1Password Integration (Recommended for Teams)

See [1Password Setup Guide](../setup/1password-setup.md) for detailed instructions.

**Quick setup**:

```bash
# Install 1Password CLI
brew install --cask 1password/tap/1password-cli

# Sign in
op account add

# Create .env.op with 1Password references
# (See 1Password guide for details)
```

### 4. Verify Setup

```bash
# Check TypeScript compilation
yarn type

# Run tests
yarn test

# Start development server
yarn start
```

If the development server starts successfully and you can access <http://localhost:3000>, you're ready to develop!

## Development Workflow

### Start Development Server

```bash
# Option 1: Traditional .env
yarn start

# Option 2: With 1Password
yarn start:op
```

**Server**: <http://localhost:3000>

**Features**:

- Hot Module Replacement (HMR)
- Automatic TypeScript compilation
- Fast refresh for React components

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

3. **Run checks**:

   ```bash
   # Type check
   yarn type

   # Lint code
   yarn lint

   # Run tests
   yarn test

   # Or run all checks
   yarn check
   ```

4. **Fix issues automatically**:

   ```bash
   # Auto-fix linting issues
   yarn fix

   # Format code
   yarn format
   ```

5. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

Pre-commit hooks will automatically run checks before allowing commit.

### Working with GraphQL

If you modify GraphQL queries or mutations:

```bash
# Generate TypeScript types
yarn gql

# Verify types are correct
yarn type
```

**See**: [Working with GraphQL Guide](./working-with-graphql.md)

### Component Development

Use Storybook for isolated component development:

```bash
# Start Storybook
yarn storybook
```

**Storybook**: <http://localhost:9001>

**Benefits**:

- Develop components in isolation
- Test different states and props
- Visual regression testing
- Documentation

## Project Structure Overview

```
web/
├── src/
│   ├── app/                  # Application code
│   │   ├── features/         # Feature modules
│   │   ├── pages/            # Page components
│   │   ├── ui/               # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utility functions
│   ├── services/             # Core services
│   │   ├── api/              # API integration
│   │   ├── auth/             # Authentication
│   │   ├── config/           # Configuration
│   │   ├── gql/              # GraphQL
│   │   └── i18n/             # Internationalization
│   └── test/                 # Test utilities
├── docs/                     # Documentation
├── dist/                     # Build output
└── coverage/                 # Test coverage reports
```

**See**: [Architecture Overview](../architecture/overview.md) for detailed structure.

## Common Tasks

### Adding a New Feature

1. Create feature directory:

   ```bash
   mkdir -p src/app/features/my-feature
   ```

2. Create feature files:

   ```
   src/app/features/my-feature/
     index.tsx           # Main component
     hooks.ts            # Custom hooks
     types.ts            # TypeScript types
     __tests__/          # Tests
   ```

3. Implement feature

4. Add tests

5. Run checks: `yarn check`

**See**: [Adding Features Guide](./adding-features.md) for detailed steps.

### Adding a UI Component

1. Create component directory:

   ```bash
   mkdir -p src/app/ui/MyComponent
   ```

2. Create component files:

   ```
   src/app/ui/MyComponent/
     index.ts            # Exports
     MyComponent.tsx     # Component
     MyComponent.test.tsx # Tests
   ```

3. Add Storybook story (optional):

   ```
   MyComponent.stories.tsx
   ```

4. Test in Storybook: `yarn storybook`

### Updating Dependencies

```bash
# Update all dependencies
yarn upgrade

# Update specific package
yarn up package-name

# Check for outdated packages
yarn outdated
```

### Building for Production

```bash
# Create production build
yarn build

# Output in dist/ directory
ls -la dist/
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 yarn start
```

### TypeScript Errors After Pulling Changes

```bash
# Regenerate GraphQL types
yarn gql

# Clear cache and reinstall
rm -rf node_modules .yarn/cache
yarn install
```

### Tests Failing

```bash
# Clear test cache
yarn test --clearCache

# Run tests in watch mode to debug
yarn test --watch
```

### Environment Variables Not Loading

1. Check file name is exactly `.env`
2. Verify variables have `REEARTH_WEB_` prefix
3. No spaces around `=` sign
4. Restart development server

**See**: [Environment Variables Reference](../reference/environment-variables.md)

### 1Password Issues

**See**: [1Password Troubleshooting](../setup/1password-setup.md#troubleshooting)

## Development Tools

### Recommended VS Code Extensions

- **ESLint** - Linting integration
- **Prettier** - Code formatting
- **TypeScript** - Enhanced TypeScript support
- **GraphQL** - GraphQL syntax highlighting
- **Emotion** - CSS-in-JS support

### Browser DevTools

- **React DevTools** - React component inspection
- **Apollo DevTools** - GraphQL debugging

## Next Steps

Once you have the development environment running:

1. **Explore the codebase**:

   - Browse `src/app/features/` for feature examples
   - Check `src/app/ui/` for UI components
   - Review `src/services/` for core services

2. **Read architecture docs**:

   - [Architecture Overview](../architecture/overview.md)
   - [State Management](../architecture/state-management.md)

3. **Learn key concepts**:

   - [Feature Flags](../concepts/feature-flags.md)
   - [Authentication](../concepts/authentication.md)
   - [3D Rendering](../concepts/3d-rendering.md)

4. **Try adding a feature**:
   - Follow [Adding Features Guide](./adding-features.md)

## Getting Help

### Documentation

- **[Commands Reference](../reference/commands.md)** - All available commands
- **[Code Conventions](../reference/code-conventions.md)** - Coding standards
- **[Module Docs](../modules/)** - Detailed module documentation

### Issues

- Check existing documentation
- Search GitHub issues
- Ask team in Slack/Discord
- Open new issue with reproduction steps

## Related Documentation

- [Commands Reference](../reference/commands.md)
- [Environment Variables](../reference/environment-variables.md)
- [Adding Features](./adding-features.md)
- [1Password Setup](../setup/1password-setup.md)

---

**Last Updated**: 2026-06-04
**Need Help?** Check troubleshooting section or ask the team
