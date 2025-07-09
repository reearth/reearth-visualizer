# Claude Development Guide for Re:Earth Visualizer Web

## Project Overview

Re:Earth Visualizer is a web-based GIS (Geographic Information System) application built with React 18, TypeScript, and Vite. It provides geospatial data visualization capabilities with 3D mapping using Cesium.

## Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **3D Engine**: Cesium (3D globes and maps)
- **State Management**: Jotai
- **GraphQL**: Apollo Client with code generation
- **UI Components**: Custom components with Emotion styling
- **Auth**: Auth0 + AWS Cognito
- **Testing**: Vitest
- **Package Manager**: Yarn 4.6.0

## Development Commands

### Core Development

- `yarn start` - Start development server (<http://localhost:3000>)
- `yarn build` - Build for production
- `yarn test` - Run unit tests with Vitest

### Code Quality

- `yarn type` - TypeScript type checking
- `yarn lint` - ESLint code linting
- `yarn fix` - Auto-fix ESLint issues
- `yarn format` - Format code with Prettier
- `yarn check` - Run type checking, linting, and tests

### Tools

- `yarn storybook` - Start Storybook UI development (<http://localhost:9001>)
- `yarn gql` - Generate GraphQL types and operations
- `yarn i18n` - Extract i18n strings for translation
- `yarn coverage` - Run tests with coverage report

## Project Structure

### Key Directories

- `src/` - Main application source code
- `src/app/` - New features and components
- `src/services/` - API services, auth, config, GraphQL
- `dist/` - Build output
- `coverage/` - Test coverage reports

### App Features (src/app/)

- `features/` - Feature components (Editor, Dashboard, etc.)
- `pages/` - Page-level components
- `ui/` - Reusable UI components and fields
- `hooks/` - Custom React hooks
- `utils/` - Utility functions

### Services (src/services/)

- `api/` - API layer for different resources
- `gql/` - GraphQL queries, mutations, and generated types
- `auth/` - Authentication providers (Auth0, Cognito)
- `config/` - Application configuration and feature flags
- `i18n/` - Internationalization setup

#### Configuration System (src/services/config/)

The configuration system manages application-wide settings and feature flags:

- **`index.ts`** - Main configuration loader and global config management
- **`appFeatureConfig.ts`** - Application feature flags and external URL generation
- **`authInfo.ts`** - Authentication configuration
- **`extensions.ts`** - Plugin and extension configuration
- **`passwordPolicy.ts`** - Password validation rules

##### App Feature Configuration

The `appFeatureConfig.ts` module controls application features and external integrations:

**Feature Flags:**
- `membersManagementOnDashboard` - Controls member management UI visibility
- `workspaceCreation` - Enables/disables workspace creation functionality  
- `workspaceManagement` - Controls workspace management features
- `accountManagement` - Enables/disables account management UI
- `externalAccountManagementUrl` - URL for external account management system

**Key Functions:**
- `loadAppFeatureConfig()` - Loads configuration during app initialization
- `generateExternalUrl()` - Generates URLs with workspace/project/user context
- `appFeature()` - Returns current feature configuration

**Usage Example:**
```typescript
// Load configuration (called during app startup)
loadAppFeatureConfig();

// Check feature availability
const features = appFeature();
if (features.membersManagementOnDashboard) {
  // Show members management UI
}

// Generate external URLs with context
const managementUrl = generateExternalUrl({
  url: "https://platform.example.com/manage/[WORKSPACE_ALIAS]",
  workspace: { alias: "my-workspace" },
  project: { alias: "my-project" },
  me: { alias: "user123" }
});
```

**Security Features:**
- Input validation for all URL parameters
- Character sanitization to prevent injection attacks
- URL validation before returning generated URLs
- Safe handling of missing/undefined values

## Development Guidelines

### Environment Setup

1. Copy `env.example` to `.env` and configure environment variables
2. Ensure Node.js >= 20.11.0 is installed
3. Use Yarn 4.6.0 as the package manager

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration via `eslint-config-reearth`
- Prettier for code formatting
- Emotion for CSS-in-JS styling
- Husky for pre-commit hooks

### Testing Strategy

- Unit tests: Vitest with React Testing Library
- Storybook for component development and testing
- Coverage reporting with c8

### GraphQL Development

- Schema and types auto-generated with GraphQL Code Generator
- Fragments organized by resource type
- Apollo Client for state management and caching

### Key Features

- 3D geospatial visualization with Cesium
- Project and workspace management
- Asset management and file uploads
- Plugin system for extensibility
- Multi-language support (i18n)

### Authentication

- Multiple auth providers supported (Auth0, AWS Cognito)
- Mock auth for development
- JWT token handling

### Performance Considerations

- Vite for fast development and builds
- Code splitting and lazy loading
- Image optimization and asset management
- 3D rendering optimization for Cesium

## Common Tasks

### Adding New Features

1. Create components in `src/app/features/`
2. Add necessary API calls in `src/services/api/`
3. Update GraphQL queries if needed
4. Add tests and stories
5. Update i18n translations

### Working with Feature Configuration

#### Adding New Feature Flags

1. **Update AppFeatureConfig type** in `src/services/config/appFeatureConfig.ts`:
   ```typescript
   export type AppFeatureConfig = {
     // existing flags...
     newFeature?: boolean;
   };
   ```

2. **Add default value** in `DEFAULT_APP_FEATURE_CONFIG`:
   ```typescript
   const DEFAULT_APP_FEATURE_CONFIG: AppFeatureConfig = {
     // existing defaults...
     newFeature: true, // or false
   };
   ```

3. **Use in components**:
   ```typescript
   import { appFeature } from "@reearth/services/config/appFeatureConfig";
   
   const features = appFeature();
   if (features.newFeature) {
     // Render feature UI
   }
   ```

#### Adding External URL Configuration

1. **Add URL field** to `AppFeatureConfig` type
2. **Update EE configuration** in `src/ee/featureConfig.ts` if needed
3. **Use generateExternalUrl()** for dynamic URL generation with context

#### Testing Feature Configuration

- Feature flags should have corresponding unit tests
- Test both enabled and disabled states
- Verify external URL generation with various inputs
- Test error handling for invalid configurations

### Working with 3D Maps

- Cesium integration is handled through `@reearth/core`
- 3D scene configuration in scene API
- Layer management for different data types

### Debugging

- React DevTools for component debugging
- Apollo DevTools for GraphQL debugging
- Sentry integration for error tracking
- Console logging utilities available

## Markdown Linting

This project uses markdownlint to ensure consistent markdown formatting. Key rules to follow:

- **MD032**: Lists should be surrounded by blank lines
- **MD034**: Bare URLs should be enclosed in angle brackets (`<url>`)

When editing markdown files, ensure proper spacing around lists and format URLs correctly.
