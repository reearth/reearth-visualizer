---
title: "Code Conventions and Standards"
category: "reference"
tags: ["coding-standards", "style-guide", "best-practices"]
last_updated: "2026-06-04"
related:
  - ../guides/adding-features.md
  - ./commands.md
---

# Code Conventions and Standards

Code standards and best practices for Re:Earth Visualizer Web development.

## TypeScript Standards

### Strict Mode

TypeScript strict mode is **enabled** project-wide.

**Configuration**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Requirements**:

- No implicit `any` types
- Strict null checks enabled
- Strict function types
- All type assertions must be justified

### Type Definitions

**Prefer interfaces for objects**:

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
}

// ❌ Avoid (use interface instead)
type UserProfile = {
  id: string;
  name: string;
};
```

**Use type for unions and primitives**:

```typescript
// ✅ Good
type Status = "active" | "inactive" | "pending";
type ID = string | number;
```

**Export types explicitly**:

```typescript
// ✅ Good
export type { UserProfile, Status };
export interface Config {}
```

## React Standards

### Component Style

**Use function components** with hooks:

```typescript
// ✅ Good
const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

**Avoid class components** (legacy only):

```typescript
// ❌ Avoid (unless maintaining legacy code)
class MyComponent extends React.Component {}
```

### Props Typing

**Always type component props**:

```typescript
type Props = {
  title: string;
  optional?: number;
  children?: React.ReactNode;
};

const Component: React.FC<Props> = ({ title, optional, children }) => {
  // ...
};
```

### Hooks Usage

**Follow React hooks rules**:

- Only call hooks at top level
- Only call hooks from React functions
- Use ESLint plugin for enforcement

**Custom hooks**:

```typescript
// ✅ Good - starts with 'use'
const useUserData = (id: string) => {
  const [data, setData] = useState<User | null>(null);
  // ...
  return data;
};
```

## Styling Standards

### Emotion CSS-in-JS

**Use Emotion for styling**:

```typescript
import styled from "@emotion/styled";

const Button = styled.button`
  padding: 8px 16px;
  background: blue;
  color: white;
`;
```

**Use theme variables**:

```typescript
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
`;
```

**Avoid inline styles**:

```typescript
// ❌ Avoid
<div style={{ padding: "8px" }}>Content</div>;

// ✅ Good
const Container = styled.div`
  padding: 8px;
`;
```

## Code Organization

### File Naming

**Components**: PascalCase

```
Button.tsx
UserProfile.tsx
DataTable.tsx
```

**Utilities**: camelCase

```
formatDate.ts
apiClient.ts
validators.ts
```

**Types**: Match corresponding file

```
Button.tsx
Button.types.ts  (if separate)
```

**Tests**: Match source with .test suffix

```
Button.tsx
Button.test.tsx
```

### Directory Structure

**Group by feature**:

```
features/
  editor/
    index.tsx
    Editor.tsx
    EditorToolbar.tsx
    hooks.ts
    types.ts
    __tests__/
```

**Group UI by component**:

```
ui/
  Button/
    index.ts
    Button.tsx
    Button.test.tsx
```

## Import Standards

### Import Order

1. React and external libraries
2. Internal absolute imports
3. Relative imports
4. Type imports (last)

```typescript
// 1. External
import React, { useState } from "react";
import styled from "@emotion/styled";

// 2. Internal absolute
import { Button } from "@reearth/app/ui";
import { useAuth } from "@reearth/services/auth";

// 3. Relative
import { EditorToolbar } from "./EditorToolbar";
import { formatDate } from "../../utils";

// 4. Types
import type { User } from "@reearth/types";
```

### Path Aliases

**Use configured aliases**:

```typescript
// ✅ Good
import { Button } from "@reearth/app/ui/Button";
import { useAuth } from "@reearth/services/auth";

// ❌ Avoid
import { Button } from "../../../../app/ui/Button";
```

**Configured aliases**:

- `@reearth/app` → `src/app`
- `@reearth/services` → `src/services`
- `@reearth/types` → `src/types`

## Naming Conventions

### Variables

**camelCase** for variables and functions:

```typescript
const userName = "John";
const getUserData = () => {};
```

**UPPER_CASE** for constants:

```typescript
const MAX_RETRIES = 3;
const API_ENDPOINT = "https://api.example.com";
```

### Functions

**Verb-first naming**:

```typescript
// ✅ Good
getUserById();
calculateTotal();
handleClick();

// ❌ Avoid
user();
total();
onClick(); // exception for event handlers
```

**Boolean functions start with is/has/should**:

```typescript
isAuthenticated();
hasPermission();
shouldRender();
```

### Components

**PascalCase** and descriptive:

```typescript
// ✅ Good
UserProfile;
DataTableRow;
FormInput;

// ❌ Avoid
Profile; // too generic
DTR; // unclear abbreviation
```

## Testing Standards

### Test Files

**Location**: Colocated with source or in `__tests__/`

```
Button.tsx
Button.test.tsx
```

or

```
Button.tsx
__tests__/
  Button.test.tsx
```

### Test Structure

**Use describe/it blocks**:

```typescript
describe("Button", () => {
  it("renders with correct text", () => {
    // test
  });

  it("calls onClick when clicked", () => {
    // test
  });
});
```

### Test Naming

**Descriptive test names**:

```typescript
// ✅ Good
it("displays error message when validation fails", () => {});

// ❌ Avoid
it("works", () => {});
it("test 1", () => {});
```

## Linting and Formatting

### ESLint

**Configuration**: `eslint-config-reearth`

**Run before commit**:

```bash
yarn lint
yarn fix
```

**Key rules**:

- No unused variables
- No console.log in production
- Consistent spacing and formatting
- React hooks rules enforced

### Prettier

**Automatic formatting**:

```bash
yarn format
```

**Configuration**: `.prettierrc`

**Settings**:

- 2 spaces indentation
- Single quotes
- Trailing commas
- Semicolons required

## Git Standards

### Commit Messages

**Format**: `type(scope): message`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Add/update tests
- `docs`: Documentation
- `chore`: Maintenance tasks

**Examples**:

```
feat(editor): add layer selection tool
fix(auth): resolve token refresh issue
refactor(api): simplify error handling
test(ui): add Button component tests
docs(setup): update 1Password guide
chore(deps): update dependencies
```

### Branch Naming

**Format**: `type/description`

```
feature/layer-selection
fix/auth-token-refresh
refactor/api-error-handling
```

## Comments and Documentation

### When to Comment

**Do comment**:

- Complex algorithms
- Non-obvious business logic
- Public APIs
- Workarounds and hacks

**Don't comment**:

- Obvious code
- Code that should be refactored instead
- Commented-out code (delete it)

### JSDoc for Public APIs

```typescript
/**
 * Loads application feature configuration from environment
 * @returns AppFeatureConfig object with feature flags
 * @throws Error if configuration is invalid
 * @see {@link file://docs/modules/services/config.md}
 */
export function loadAppFeatureConfig(): AppFeatureConfig {
  // ...
}
```

### Inline Comments

```typescript
// ✅ Good - explains why
// Using setTimeout to avoid race condition with React 18 batching
setTimeout(() => updateState(), 0);

// ❌ Avoid - explains what (obvious from code)
// Set the user name to John
userName = "John";
```

## Best Practices

### Avoid Over-Engineering

**Keep it simple**:

```typescript
// ✅ Good - simple and clear
const total = price * quantity;

// ❌ Over-engineered
const calculateTotal = (price: number, quantity: number) =>
  new PriceCalculator()
    .setPrice(price)
    .setQuantity(quantity)
    .calculate()
    .getResult();
```

### Prefer Composition

```typescript
// ✅ Good - composed
const EnhancedButton = withLoading(withTooltip(Button));

// ❌ Avoid - inheritance
class EnhancedButton extends LoadingButton {}
```

### Error Handling

**Always handle errors**:

```typescript
try {
  await fetchData();
} catch (error) {
  console.error("Failed to fetch:", error);
  showErrorToast();
}
```

**Use type guards**:

```typescript
if (error instanceof ApiError) {
  handleApiError(error);
} else {
  handleUnknownError(error);
}
```

## Performance Considerations

### Memoization

**Use useMemo for expensive calculations**:

```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

**Use useCallback for callbacks**:

```typescript
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Code Splitting

**Lazy load features**:

```typescript
const Editor = lazy(() => import("./features/Editor"));
```

## Security Standards

### Input Validation

**Always validate user input**:

```typescript
const sanitizedInput = sanitizeHtml(userInput);
```

### Avoid XSS

**Use React's built-in escaping**:

```typescript
// ✅ Safe - React escapes automatically
<div>{userInput}</div>

// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Environment Variables

**Never commit secrets**:

- Use `.env.local` for local secrets
- Use 1Password for team secrets
- See [Environment Variables](./environment-variables.md)

## Husky Pre-commit Hooks

**Automatic checks** before commit:

- Linting
- Type checking
- Formatting
- Tests (on changed files)

**Configuration**: `.husky/`

## Related Documentation

- [Commands Reference](./commands.md)
- [Adding Features Guide](../guides/adding-features.md)
- [Testing Strategy](../concepts/testing-strategy.md)

---

**Last Updated**: 2026-06-04
