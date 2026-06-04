---
title: "Architecture Overview"
category: "architecture"
tags: ["architecture", "system-design", "overview"]
last_updated: "2026-06-04"
related:
  - ./data-flow.md
  - ./state-management.md
  - ../modules/services/config.md
---

# Architecture Overview

High-level overview of Re:Earth Visualizer Web architecture, design principles, and system structure.

## System Overview

Re:Earth Visualizer Web is a modern single-page application (SPA) built with:

- **React 18** - UI framework with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Cesium** - 3D geospatial visualization engine
- **Apollo Client** - GraphQL client with caching
- **Jotai** - Atomic state management

## Architecture Principles

### 1. Layered Architecture

The application is organized into distinct layers:

```
┌─────────────────────────────────────┐
│         App Layer (UI)              │
│  Features • Pages • UI Components   │
├─────────────────────────────────────┤
│       Services Layer (Core)         │
│   API • Auth • Config • GraphQL     │
├─────────────────────────────────────┤
│       External Dependencies         │
│   Cesium • Apollo • Jotai           │
└─────────────────────────────────────┘
```

**App Layer** (`src/app/`):

- User-facing features and components
- Page components and routing
- Reusable UI components
- Custom hooks for business logic

**Services Layer** (`src/services/`):

- Core business logic
- API integration and data fetching
- Authentication and authorization
- Configuration management
- GraphQL operations

### 2. Feature-Based Organization

Features are self-contained modules with their own:

- UI components
- Business logic (hooks)
- Type definitions
- Tests

**Example**:

```
src/app/features/editor/
  ├── index.tsx           # Main feature component
  ├── EditorToolbar.tsx   # Sub-components
  ├── EditorCanvas.tsx
  ├── hooks.ts            # Feature-specific hooks
  ├── types.ts            # Type definitions
  └── __tests__/          # Tests
```

### 3. Dependency Direction

Dependencies flow in one direction:

```
App Layer → Services Layer → External Dependencies
```

**Rules**:

- App layer can import from services layer
- Services layer cannot import from app layer
- Shared code goes in services or utilities

## Project Structure

### Source Code Organization

```
src/
├── app/                    # Application Layer
│   ├── features/          # Feature modules
│   │   ├── editor/        # Map editor
│   │   ├── dashboard/     # Project dashboard
│   │   └── visualizer/    # 3D visualization
│   ├── pages/             # Page components
│   ├── ui/                # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Form/
│   ├── hooks/             # Shared custom hooks
│   └── utils/             # Utility functions
│
├── services/              # Services Layer
│   ├── api/              # API integration
│   │   ├── projects.ts
│   │   ├── assets.ts
│   │   └── users.ts
│   ├── auth/             # Authentication
│   │   ├── authProvider.tsx
│   │   ├── auth0.ts
│   │   └── cognito.ts
│   ├── config/           # Configuration
│   │   ├── index.ts
│   │   ├── appFeatureConfig.ts
│   │   └── authInfo.ts
│   ├── gql/              # GraphQL
│   │   ├── queries/
│   │   ├── mutations/
│   │   └── __gen__/      # Generated types
│   ├── i18n/             # Internationalization
│   ├── state/            # Global state atoms
│   └── theme/            # Theming
│
├── ee/                    # Enterprise Edition
│   └── featureConfig.ts  # EE-specific config
│
└── test/                  # Test utilities
    └── setup.ts
```

### Build Output

```
dist/
├── index.html           # Main HTML entry
├── assets/              # Bundled JS/CSS
│   ├── index-[hash].js
│   └── index-[hash].css
└── storybook/           # Storybook build (optional)
```

## Key Architectural Patterns

### 1. Configuration-Driven Features

Features are controlled via configuration rather than code changes:

```typescript
const features = appFeature();

if (features.workspaceCreation) {
  return <CreateWorkspaceButton />;
}
```

**Benefits**:

- Enable/disable features per environment
- A/B testing capabilities
- Gradual rollout support

**See**: [Feature Flags](../concepts/feature-flags.md)

### 2. GraphQL-First Data Fetching

All backend communication uses GraphQL:

```typescript
const { data, loading } = useQuery(GET_PROJECT, {
  variables: { id: projectId },
});
```

**Benefits**:

- Type-safe queries and mutations
- Efficient data fetching (request only needed fields)
- Automatic caching via Apollo Client

**See**: [GraphQL Module](../modules/services/gql.md)

### 3. Atomic State Management

Global state managed with Jotai atoms:

```typescript
// Define atom
const userAtom = atom<User | null>(null);

// Use in component
const [user, setUser] = useAtom(userAtom);
```

**Benefits**:

- Minimal boilerplate
- Great TypeScript support
- Easy to test
- No prop drilling

**See**: [State Management](./state-management.md)

### 4. Component Composition

UI built through composition, not inheritance:

```typescript
// ✅ Good - composition
<Modal>
  <ModalHeader title="Settings" />
  <ModalBody>
    <SettingsForm />
  </ModalBody>
</Modal>
```

**Benefits**:

- Flexible and reusable
- Easy to understand
- Better TypeScript inference

## Technology Stack

### Core Technologies

| Technology       | Purpose                  | Version |
| ---------------- | ------------------------ | ------- |
| React            | UI framework             | 18.x    |
| TypeScript       | Type safety              | 5.x     |
| Vite             | Build tool & dev server  | 6.x     |
| Cesium           | 3D visualization         | Latest  |
| Apollo Client    | GraphQL client           | 3.x     |
| Jotai            | State management         | 2.x     |
| Emotion          | CSS-in-JS                | 11.x    |
| Vitest           | Testing framework        | 3.x     |
| React Router     | Routing                  | 6.x     |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Storybook** - Component development
- **GraphQL Code Generator** - Type generation

## Data Flow

### Typical Request Flow

```
1. User Action (Click button)
         ↓
2. Event Handler (Component)
         ↓
3. Custom Hook (Business logic)
         ↓
4. GraphQL Query/Mutation (Apollo)
         ↓
5. Backend API
         ↓
6. Response → Apollo Cache
         ↓
7. Component Re-render (React)
         ↓
8. UI Update
```

**See**: [Data Flow](./data-flow.md) for detailed explanation

## 3D Rendering Architecture

### Cesium Integration

```
React Components
      ↓
@reearth/core (3D engine wrapper)
      ↓
Cesium.js (3D visualization)
      ↓
WebGL (Rendering)
```

**Key concepts**:

- Scene management
- Layer system
- Camera controls
- Terrain and imagery providers

**See**: [3D Rendering](../concepts/3d-rendering.md)

## Authentication Flow

```
1. User visits app
2. Auth provider check (Auth0/Cognito/Mock)
3. Redirect to login if needed
4. Token obtained and stored
5. Token included in GraphQL requests
6. Backend validates token
7. User data loaded
8. App rendered
```

**See**: [Authentication](../concepts/authentication.md)

## Build and Deployment

### Development Build

```bash
yarn start
# - Fast HMR
# - Source maps
# - Development logging
```

### Production Build

```bash
yarn build
# - Minification
# - Tree shaking
# - Code splitting
# - Asset optimization
```

### Build Output Optimization

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Image compression, CSS minification
- **Lazy Loading**: Dynamic imports for features

## Performance Considerations

### 1. Bundle Size

- Lazy load features and heavy dependencies
- Use dynamic imports for large libraries
- Tree shake unused code

### 2. Rendering Performance

- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for long lists

### 3. 3D Performance

- Level of detail (LOD) for 3D models
- Frustum culling
- Texture compression
- Efficient terrain rendering

## Security Architecture

### 1. Authentication

- Token-based authentication (JWT)
- Secure token storage
- Token refresh mechanism
- Logout and session cleanup

### 2. Authorization

- Role-based access control (RBAC)
- Backend enforces permissions
- Frontend hides unavailable features

### 3. Data Security

- HTTPS only
- No secrets in frontend code
- Environment variables for configuration
- 1Password for secret management

**See**: [1Password Setup](../setup/1password-setup.md)

## Testing Strategy

### Test Pyramid

```
     ┌─────────┐
    │   E2E    │  (Few - Critical paths)
   ├──────────┤
  │Integration│  (Some - Feature tests)
 ├───────────┤
│   Unit     │  (Many - Component/function tests)
└───────────┘
```

**Test Distribution**:

- **Unit Tests** (70%): Components, hooks, utilities
- **Integration Tests** (20%): Feature workflows
- **E2E Tests** (10%): Critical user journeys

**See**: [Testing Strategy](../concepts/testing-strategy.md)

## Scalability Considerations

### Code Organization

- Feature-based structure scales with team size
- Clear boundaries between features
- Independent feature development

### Performance

- Code splitting prevents bundle bloat
- Lazy loading keeps initial load fast
- Apollo cache reduces redundant requests

### Maintainability

- TypeScript catches errors early
- Comprehensive documentation
- Automated tests provide confidence

## Migration Path

### Adding New Features

1. Create feature directory in `src/app/features/`
2. Implement using existing patterns
3. Add feature flag if needed
4. Write tests
5. Document in `docs/modules/features/`

### Modifying Existing Features

1. Identify impacted files
2. Update implementation
3. Update tests
4. Update documentation
5. Run `yarn check` before commit

## Related Documentation

- [Data Flow](./data-flow.md)
- [State Management](./state-management.md)
- [Configuration System](../modules/services/config.md)
- [Feature Flags](../concepts/feature-flags.md)
- [Testing Strategy](../concepts/testing-strategy.md)

## Architecture Decision Records

For detailed architectural decisions, see [ADRs](./adr/):

- [ADR 001: TBD](./adr/)

---

**Last Updated**: 2026-06-04
**Maintained By**: Platform Team
