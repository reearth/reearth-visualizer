# Services/API Architecture Guide

## Overview

The `services/api` folder contains a modular, well-organized API layer for Re:Earth Visualizer that follows strict separation of concerns and consistent naming conventions. This architecture provides clean, reusable hooks for data fetching (queries) and data manipulation (mutations).

## Architecture Principles

### 1. **Module-Based Organization**

Each API domain is organized into its own folder with a consistent structure:

```
api/
├── domain/              # e.g., layer, widget, scene, etc.
│   ├── index.ts        # Re-exports all hooks and types
│   ├── types.ts        # TypeScript type definitions
│   ├── useDomainQueries.ts     # Data fetching hooks
│   ├── useDomainMutations.ts   # Data manipulation hooks
│   └── utils.ts        # Helper functions (optional)
```

### 2. **Strict Query/Mutation Separation**

- **Query hooks** (`use*Queries.ts`): Handle data fetching, return data + loading/error states
- **Mutation hooks** (`use*Mutations.ts`): Handle data manipulation, return async functions

### 3. **Proper React Hook Patterns**

- **Query hooks** are actual React hooks that follow Rules of Hooks
- **Mutation hooks** return objects containing async functions (not hooks)
- No "hook factories" or hooks that return other hooks

## Naming Conventions

### Query Hooks

```typescript
// Pattern: use + Domain + specific query name
export const useNLSLayers = ({ sceneId }: SceneQueryProps) => { ... }
export const useLayerStyles = ({ sceneId }: SceneQueryProps) => { ... }
export const useScene = ({ sceneId }: SceneQueryProps) => { ... }
```

### Mutation Hooks

```typescript
// Pattern: use + Domain + Mutations
export const useNLSLayerMutations = () => {
  return {
    addNLSLayerSimple, // async function
    updateNLSLayer, // async function
    removeNLSLayer // async function
  };
};
```

### Specialized Mutation Hooks

For domains with multiple logical groups of mutations:

```typescript
export const useNLSLayerMutations = () => { ... }           // Core CRUD operations
export const useNLSLayerCustomPropertyMutations = () => { ... } // Custom property operations
```

## File Structure Examples

### Complete Module Structure

```typescript
// layer/index.ts
export * from "./useNLSLayerQueries";
export * from "./useNLSLayerMutations";
export * from "./useNLSLayerCustomPropertyMutations";
export * from "./types";

// layer/types.ts
export type NLSLayer = { ... };
export type SceneQueryProps = { sceneId?: string };

// layer/useNLSLayerQueries.ts
export const useNLSLayers = ({ sceneId }: SceneQueryProps) => {
  // React hook implementation
  return { nlsLayers, loading, error };
};

// layer/useNLSLayerMutations.ts
export const useNLSLayerMutations = () => {
  // Return object with async functions
  return {
    addNLSLayerSimple: async (input) => { ... },
    updateNLSLayer: async (input) => { ... }
  };
};
```

## Usage Patterns

### Query Usage (Proper React Hook)

```typescript
import { useNLSLayers } from "@reearth/services/api/layer";

const Component = ({ sceneId }) => {
  // This follows Rules of Hooks - can be used in component body
  const { nlsLayers, loading, error } = useNLSLayers({ sceneId });

  if (loading) return <Loading />;
  return <LayerList layers={nlsLayers} />;
};
```

### Mutation Usage (Event Handlers)

```typescript
import { useNLSLayerMutations } from "@reearth/services/api/layer";

const Component = () => {
  // Get mutation functions once
  const { addNLSLayerSimple, updateNLSLayer } = useNLSLayerMutations();

  // Use in event handlers
  const handleAdd = useCallback(async () => {
    await addNLSLayerSimple({ ... });
  }, [addNLSLayerSimple]);

  const handleUpdate = useCallback(async (layerId, data) => {
    await updateNLSLayer({ layerId, ...data });
  }, [updateNLSLayer]);
};
```

## Type Safety

### Return Types

```typescript
// Consistent return types across all mutations
export type MutationReturn<T> = {
  data?: T | null | undefined;
  status: "success" | "error";
  errors?: readonly GraphQLFormattedError[];
};

// Query return types follow Apollo Client patterns
const { data, loading, error, refetch } = useQuery(...)
```

### Input Types

```typescript
// Use generated GraphQL types for inputs
import {
  AddNlsLayerSimpleInput,
  UpdateNlsLayerInput
} from "@reearth/services/gql/__gen__/graphql";
```

## Error Handling & Notifications

### Consistent Error Handling

```typescript
export const useDomainMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const mutationFunction = useCallback(
    async (input) => {
      const { data, errors } = await mutationCall({ variables: { input } });

      if (errors || !data?.expectedField) {
        setNotification({ type: "error", text: t("Operation failed.") });
        return { status: "error", errors };
      }

      setNotification({ type: "success", text: t("Operation succeeded!") });
      return { data, status: "success" };
    },
    [mutationCall, setNotification, t]
  );
};
```

## Domain Examples

### Layer Domain

```typescript
// Queries
useNLSLayers({ sceneId }); // Fetch all layers for scene

// Mutations
useNLSLayerMutations(); // Core CRUD: add, update, remove layers
useNLSLayerCustomPropertyMutations(); // Custom property operations
```

### Widget Domain

```typescript
// Queries
useWidgetQueries(); // Widget-related queries

// Mutations
useWidgetMutations(); // Widget CRUD operations
```

### Scene Domain

```typescript
// Queries
useScene({ sceneId }); // Fetch scene data
useValidateSceneAlias(); // Validate scene alias

// No mutations (scene is read-only in current implementation)
```

## Migration Guidelines

### When Migrating Existing APIs

1. **Separate concerns**: Split single hooks into query + mutation hooks
2. **Fix naming**: Remove `use` prefix from non-hook functions
3. **Organize by domain**: Group related functionality into domain folders
4. **Maintain consistency**: Follow established naming patterns
5. **Update imports**: Update all import statements to use new structure

### Example Migration

```typescript
// OLD (problematic)
const useLayersApi = () => {
  const getLayersQuery = () => useQuery(...);  // Hook inside function
  const updateLayer = async () => { ... };     // Mixed with hook
  return { getLayersQuery, updateLayer };
};

// NEW (correct)
export const useNLSLayers = ({ sceneId }) => {
  return useQuery(...);  // Proper hook
};

export const useNLSLayerMutations = () => {
  return {
    updateNLSLayer: async () => { ... }  // Async function
  };
};
```

## Benefits of This Architecture

1. **Type Safety**: Full TypeScript support with generated GraphQL types
2. **Performance**: Queries only run when hooks are used
3. **Maintainability**: Clear separation of concerns and consistent patterns
4. **Reusability**: Hooks can be composed and reused across components
5. **Testing**: Easy to mock and test individual functions
6. **Developer Experience**: IntelliSense, auto-completion, and clear API contracts

## Best Practices

1. **Always** separate queries from mutations
2. **Never** call hooks inside functions - only in component bodies
3. **Use** descriptive names that indicate the domain and operation
4. **Include** proper error handling and user notifications
5. **Export** types alongside hooks for better development experience
6. **Follow** the established file structure for consistency
7. **Document** complex business logic with comments
8. **Test** both success and error scenarios

This architecture ensures a scalable, maintainable, and developer-friendly API layer for the Re:Earth Visualizer application.
