# Re:Earth Visualizer Application Architecture

This directory contains the main application code for Re:Earth Visualizer, organized following clean architecture principles and React best practices.

## Directory Structure

```
app/
├── pages/          # Top-level page components and routing
├── features/       # Feature-based business logic modules
├── ui/             # Reusable UI components and design system
├── hooks/          # Custom React hooks for shared logic
├── lib/            # Third-party library integrations and wrappers
├── utils/          # Pure utility functions and helpers
└── types/          # TypeScript type definitions
```

## Architecture Overview

### Pages (`pages/`)

Top-level page components that define application routes and layouts:

- `Dashboard/` - Main dashboard and project management
- `EditorPage/` - 3D map editor interface
- `PublishedPage/` - Public viewing of published projects
- `ProjectSettingsPage/` - Project configuration
- `AccountSettingsPage/` - User account management
- `WorkspaceSettingPage/` - Workspace administration
- `PluginPlaygroundPage/` - Plugin development environment
- `GraphQLPlayground/` - GraphQL API explorer

### Features (`features/`)

Self-contained feature modules with their own business logic:

**Core Features:**

- `Editor/` - 3D map editing functionality
  - `Map/` - Layer management, data sources, styling
  - `Visualizer/` - 3D visualization engine integration
  - `Widgets/` - Interactive widget system
  - `Story/` - Storytelling and presentation tools
  - `Publish/` - Project publishing workflow

**Application Features:**

- `Dashboard/` - Project and workspace management
- `AssetsManager/` - File and asset management
- `PluginPlayground/` - Plugin development tools
- `ProjectSettings/` - Project configuration
- `WorkspaceSetting/` - Workspace administration
- `AccountSetting/` - User profile management

**UI Features:**

- `Navbar/` - Application navigation
- `Notification/` - Toast notifications
- `GlobalModal/` - Application-wide modals
- `Visualizer/` - 3D visualization components

### UI (`ui/`)

Reusable UI components following atomic design principles:

- `components/` - Generic UI components
- `fields/` - Form field components with validation
- `layout/` - Layout and positioning components
- `assets/` - Static assets (images, icons)

### Hooks (`hooks/`)

Custom React hooks for shared application logic:

- Navigation and routing helpers
- Double-click detection
- Load more pagination
- Account settings management
- Workspace menu handling

### Libraries (`lib/`)

Third-party library integrations and custom implementations:

- `reearth-ui/` - Core UI component library
- `reearth-widget-ui/` - Widget-specific UI components
- `lexical/` - Rich text editor integration

### Utils (`utils/`)

Pure utility functions organized by domain:

- `camera.ts` - 3D camera utilities
- `file.ts` - File handling utilities
- `image.ts` - Image processing
- `time.ts` - Date/time utilities
- `layer-style.ts` - Layer styling helpers
- `sketch.ts` - Drawing and sketching utilities

### Types (`types/`)

TypeScript type definitions:

- `index.ts` - Common application types
- `sceneProperty.ts` - 3D scene property types

## Development Guidelines

### Feature Organization

Each feature should be self-contained with:

```
features/FeatureName/
├── index.tsx           # Main feature component
├── hooks.ts           # Feature-specific hooks
├── types.ts           # Feature-specific types
├── constants.ts       # Feature constants
└── components/        # Internal components
```

### Component Structure

Follow the component hierarchy:

1. **Pages** - Route-level components, handle routing and layout
2. **Features** - Business logic, API integration, state management
3. **UI Components** - Pure presentation, no business logic
4. **Hooks** - Reusable stateful logic
5. **Utils** - Pure functions

### Import Organization

```typescript
// External libraries
import React from "react";
import { useQuery } from "@apollo/client";

// Internal services
import { useAuth } from "@/services/auth";

// App-level imports
import { Button } from "@/app/ui/components";
import { useDoubleClick } from "@/app/hooks";

// Feature-level imports
import { useEditorState } from "./hooks";
```

### Testing Strategy

- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for features
- E2E tests for complete user workflows

## Key Integrations

- **3D Engine**: Cesium via `@reearth/core`
- **State Management**: Jotai atoms
- **Forms**: Formik with custom field components
- **Styling**: Emotion with theme system
- **Icons**: Lucide React
- **Rich Text**: Lexical editor
