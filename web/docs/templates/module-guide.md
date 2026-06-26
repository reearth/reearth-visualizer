---
title: "[Module Name]"
module: "[path/to/module]"
category: "module"
tags: []
last_updated: "YYYY-MM-DD"
related: []
maintainers: []
---

# [Module Name]

## Overview

[Brief 2-3 sentence description of what this module does and why it exists]

## Purpose

[Detailed explanation of the module's role in the application]

## Key Components

- **Component 1**: Description and purpose
- **Component 2**: Description and purpose
- **Component 3**: Description and purpose

## Architecture

[Describe how the module is structured, key patterns used, and design decisions]

```
[Optional: ASCII diagram or description of component relationships]
```

## Dependencies

### Internal Dependencies

- `@reearth/[module]` - Purpose
- `src/[path]` - Purpose

### External Dependencies

- `package-name` - Purpose and usage

## API Reference

### Function: `functionName()`

**Purpose**: [What this function does]

**Parameters**:

- `param1: Type` - Description
- `param2: Type` - Description

**Returns**: `ReturnType` - Description

**Example**:

```typescript
const result = functionName(arg1, arg2);
```

**Code Reference**: `src/path/to/file.ts:42`

### Type: `TypeName`

```typescript
export type TypeName = {
  field1: string;
  field2: number;
};
```

**Purpose**: [What this type represents]

**Code Reference**: `src/path/to/file.ts:15`

## Usage Examples

### Basic Usage

```typescript
// Example showing the most common use case
import { functionName } from "@reearth/module";

const result = functionName();
```

### Advanced Usage

```typescript
// Example showing advanced scenarios
import { functionName, TypeName } from "@reearth/module";

const config: TypeName = {
  field1: "value",
  field2: 42,
};

const result = functionName(config);
```

## Configuration

[If the module requires configuration, document it here]

### Environment Variables

- `REEARTH_WEB_[VAR_NAME]` - Description and default value

### Runtime Configuration

[Any runtime configuration options]

## Testing

### Unit Tests

Location: `src/path/to/__tests__/`

Run tests:

```bash
yarn test src/path/to/
```

### Integration Tests

[If applicable, describe integration test scenarios]

## Common Issues

### Issue: "[Common error or problem]"

**Symptoms**: [How the issue manifests]

**Cause**: [Why this happens]

**Solution**:

```typescript
// Code showing the fix
```

**Related**: [Link to related documentation or issues]

## Performance Considerations

[Any performance implications or optimization tips]

## Security Considerations

[Any security-related concerns or best practices]

## Migration Guide

[If this module replaces or changes existing functionality, document migration steps]

## Related Documentation

- [Link to related module](../path/to/doc.md)
- [Link to related concept](../../concepts/concept.md)
- [Link to guide](../../guides/guide.md)

## Code References

- `src/path/to/main.ts` - Main entry point
- `src/path/to/types.ts` - Type definitions
- `src/path/to/utils.ts` - Utility functions

## Changelog

### [YYYY-MM-DD] - Initial Documentation

- Created module documentation
