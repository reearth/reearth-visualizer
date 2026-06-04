---
title: "[Feature Name]"
feature: "[feature-identifier]"
category: "feature"
tags: []
last_updated: "YYYY-MM-DD"
related: []
maintainers: []
---

# [Feature Name]

## Overview

[Brief description of the feature and its value to users]

## User Journey

[Describe the typical user workflow when using this feature]

1. User navigates to [location]
2. User performs [action]
3. System responds with [result]

## Feature Components

### UI Components

- **Component 1** (`src/app/features/[feature]/Component1.tsx`) - Description
- **Component 2** (`src/app/features/[feature]/Component2.tsx`) - Description

### Hooks

- **useFeatureHook** (`src/app/features/[feature]/hooks.ts`) - Purpose and usage

### API Integration

- **API Method**: `method()`
- **GraphQL Query**: `QUERY_NAME`
- **Endpoint**: `/api/[endpoint]`

## Technical Architecture

```
[Diagram showing component hierarchy and data flow]
```

### State Management

[Describe how state is managed - Jotai atoms, local state, etc.]

### Data Flow

1. User action triggers [component]
2. Component calls [hook/api]
3. Data flows through [state management]
4. UI updates with [result]

## Implementation Details

### Key Files

- `src/app/features/[feature]/index.tsx` - Main feature component
- `src/app/features/[feature]/hooks.ts` - Custom hooks
- `src/app/features/[feature]/types.ts` - Type definitions
- `src/services/api/[resource].ts` - API integration

### Feature Flags

[If applicable, document any feature flags controlling this feature]

```typescript
const features = appFeature();
if (features.featureName) {
  // Feature is enabled
}
```

## Usage Examples

### Basic Usage

[Show how developers would integrate or extend this feature]

```typescript
import { FeatureComponent } from "@reearth/app/features/feature";

const MyComponent = () => {
  return <FeatureComponent />;
};
```

### Advanced Customization

[Show advanced integration patterns]

## GraphQL Schema

### Queries

```graphql
query FeatureQuery($id: ID!) {
  feature(id: $id) {
    id
    name
  }
}
```

### Mutations

```graphql
mutation UpdateFeature($input: UpdateFeatureInput!) {
  updateFeature(input: $input) {
    feature {
      id
    }
  }
}
```

## Permissions & Access Control

[Document any permissions or roles required to use this feature]

## Internationalization

[List i18n keys used by this feature]

- `feature.title` - Feature title
- `feature.description` - Feature description
- `feature.action` - Action button text

## Testing

### Unit Tests

Location: `src/app/features/[feature]/__tests__/`

Key test scenarios:

- [ ] Component renders correctly
- [ ] User interactions work as expected
- [ ] Error states are handled
- [ ] Loading states display properly

### Integration Tests

[Describe end-to-end testing scenarios]

### Manual Testing Checklist

- [ ] Test item 1
- [ ] Test item 2
- [ ] Test item 3

## Known Issues

### Issue: "[Known limitation or bug]"

**Description**: [Detailed description]

**Workaround**: [If available]

**Status**: [Open/In Progress/Fixed]

## Future Enhancements

- [ ] Enhancement 1
- [ ] Enhancement 2
- [ ] Enhancement 3

## Related Documentation

- [Related feature](./related-feature.md)
- [Related concept](../../concepts/concept.md)
- [API Reference](../../modules/services/api.md)

## Code References

- `src/app/features/[feature]/` - Feature directory
- `src/services/api/[resource].ts:42` - API integration

## Changelog

### [YYYY-MM-DD] - Initial Release

- Feature released to production

### [YYYY-MM-DD] - Enhancement

- Added new functionality
