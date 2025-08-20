# Re:Earth UI Components Development Guide

This document describes the patterns and guidelines for implementing components in the `reearth-ui/components` directory.

## Component Architecture Patterns

### File Structure

Each component follows a standardized directory structure:

```
ComponentName/
├── index.tsx          # Main component implementation
├── index.stories.tsx  # Storybook stories
└── index.test.tsx     # Unit tests
```

### Component Implementation Patterns

#### 1. TypeScript Props Interface

All components export a typed props interface following the pattern `{ComponentName}Props`:

```typescript
export type ButtonProps = {
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  disabled?: boolean;
  size?: "normal" | "small";
  // ... other props
  "data-testid"?: string;
};
```

**Key Patterns:**

- Use optional props with sensible defaults
- Include `data-testid` for testing
- Use union types for constrained values (appearance, size, etc.)
- Follow consistent naming conventions

#### 2. Component Declaration

```typescript
export const ComponentName: FC<ComponentNameProps> = ({
  prop1 = "defaultValue",
  prop2,
  // ... destructure all props
}) => {
  // Component logic
  return <StyledComponent>{/* JSX */}</StyledComponent>;
};
```

**Key Patterns:**

- Use functional components with `FC<Props>` type
- Destructure all props in function signature
- Set default values in destructuring
- Export as named export (not default)

#### 3. Styling with Emotion

Components use `@reearth/services/theme` and Emotion for styling:

```typescript
import { styled } from "@reearth/services/theme";

const StyledComponent = styled("div", {
  shouldForwardProp: (prop) => !["customProp"].includes(prop)
})<{
  customProp?: boolean;
}>(({ theme, customProp }) => ({
  color: theme.content.main,
  backgroundColor: theme.bg[1]
  // ... styles based on theme and props
}));
```

**Key Patterns:**

- Import `styled` from `@reearth/services/theme`
- Use `shouldForwardProp` to prevent custom props from reaching DOM
- Access theme values consistently (`theme.content.main`, `theme.bg[1]`, etc.)
- Use theme spacing, colors, and radius values
- Support responsive behavior and state variations

#### 4. State Management

```typescript
import { useState, useEffect, useCallback } from "react";

const [state, setState] = useState(initialValue);

const handleChange = useCallback(
  (newValue) => {
    setState(newValue);
    onChange?.(newValue);
  },
  [onChange]
);

useEffect(() => {
  setState(externalValue);
}, [externalValue]);
```

**Key Patterns:**

- Use `useState` for local component state
- Use `useCallback` for event handlers
- Use `useEffect` to sync with external prop changes
- Call optional callback props with optional chaining (`?.`)

#### 5. Accessibility

```typescript
<StyledComponent
  role="button"
  aria-label={ariaLabel}
  aria-checked={isChecked}
  tabIndex={disabled ? -1 : 0}
  data-testid={dataTestid}
>
```

**Key Patterns:**

- Include appropriate ARIA attributes
- Support keyboard navigation
- Provide accessible labels
- Handle disabled states properly

## Testing Patterns

### Test Structure

```typescript
import { fireEvent, render, screen } from "@reearth/test/utils";
import { expect, describe, it, vi } from "vitest";

import { ComponentName } from ".";

describe("ComponentName Component", () => {
  it("renders with default props", () => {
    render(<ComponentName />);
    // Assertions
  });

  it("calls callback when interacted", () => {
    const handleCallback = vi.fn();
    render(<ComponentName onCallback={handleCallback} />);
    // Interact and assert
  });
});
```

**Key Patterns:**

- Use `@reearth/test/utils` for render utilities
- Use Vitest (`vi.fn()`, `expect`, `describe`, `it`)
- Test default rendering
- Test callback functionality
- Test disabled states
- Test different prop combinations
- Use `screen.getByRole()` for accessibility-based queries

## Storybook Stories Patterns

### Story Structure

```typescript
import { Meta, StoryObj } from "@storybook/react";
import { ComponentName, ComponentNameProps } from ".";

const meta: Meta<ComponentNameProps> = {
  component: ComponentName
};

export default meta;
type Story = StoryObj<ComponentNameProps>;
```

### Story Implementation Approaches

#### Approach 1: Args-based (Recommended for simple components)

```typescript
export const Default: Story = {
  args: {
    value: "Default value",
    disabled: false
  }
};

export const Disabled: Story = {
  args: {
    value: "Disabled",
    disabled: true
  }
};
```

#### Approach 2: Render-based (For complex demos)

```typescript
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <ComponentName variant="primary" />
      <ComponentName variant="secondary" />
      <ComponentName variant="danger" disabled />
    </div>
  )
};
```

#### Approach 3: Data-driven (For components with complex data)

```typescript
const sampleItems = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2", disabled: true },
  { id: "3", label: "Option 3" }
];

export const WithData: Story = {
  args: {
    items: sampleItems,
    value: "1"
  }
};
```

### Common Story Variants

Every component should typically include these stories:

- **Default**: Basic usage with minimal props
- **Disabled**: Disabled state
- **Size Variants**: If component supports different sizes
- **Appearance Variants**: If component has different visual styles
- **With Icons**: If component supports icons
- **Edge Cases**: Empty states, error states, loading states

### Interactive Stories

For interactive components, use actions:

```typescript
import { action } from "@storybook/addon-actions";

export const Interactive: Story = {
  args: {
    onChange: action("changed"),
    onClick: action("clicked")
  }
};
```

## Common Props Patterns

### Standard Props

Most components should support these common props:

```typescript
type CommonProps = {
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  ariaLabel?: string;
};
```

### Size Props

```typescript
type SizeProps = {
  size?: "small" | "normal" | "large";
};
```

### Appearance Props

```typescript
type AppearanceProps = {
  appearance?: "primary" | "secondary" | "danger" | "simple";
};
```

### Layout Props

```typescript
type LayoutProps = {
  extendWidth?: boolean;
  minWidth?: number;
};
```

## Icon Integration

Components that use icons should follow this pattern:

```typescript
import { Icon, IconName } from "../Icon";

type ComponentProps = {
  icon?: IconName;
  iconColor?: string;
};

// In component
{icon && (
  <Icon
    icon={icon}
    color={iconColor}
    aria-hidden="true"
  />
)}
```

## Theme Integration

### Using Theme Values

```typescript
// Colors
theme.content.main; // Primary text color
theme.content.weak; // Secondary text color
theme.content.weaker; // Tertiary text color
theme.bg[1]; // Primary background
theme.bg[2]; // Secondary background
theme.primary.main; // Primary accent color
theme.dangerous.main; // Danger/error color
theme.outline.weak; // Border color

// Spacing
theme.spacing.micro; // 2px
theme.spacing.smallest; // 4px
theme.spacing.small; // 8px
theme.spacing.normal; // 12px
theme.spacing.large; // 16px

// Radius
theme.radius.small; // 4px
theme.radius.normal; // 8px

// Shadows
theme.shadow.button; // Button shadow
theme.shadow.input; // Input shadow
```

## Performance Considerations

- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Use `useMemo` for expensive calculations
- Avoid inline styles and functions in JSX
- Use `shouldForwardProp` to prevent unnecessary DOM props

## Accessibility Guidelines

- Always include `aria-label` or `aria-labelledby` for interactive elements
- Support keyboard navigation with proper `tabIndex`
- Use semantic HTML elements when possible
- Include `role` attributes for custom components
- Provide focus indicators
- Support screen readers with appropriate ARIA attributes

## Adding a New Component

1. **Create directory structure**:

   ```
   mkdir src/app/lib/reearth-ui/components/NewComponent
   ```

2. **Implement component** (`index.tsx`):

   - Define props interface
   - Implement component with styling
   - Export component and props type

3. **Add tests** (`index.test.tsx`):

   - Test default rendering
   - Test prop variations
   - Test interactions and callbacks
   - Test accessibility

4. **Create stories** (`index.stories.tsx`):

   - Default story
   - Variant stories (disabled, sizes, appearances)
   - Interactive stories with actions

5. **Export from main index**:
   ```typescript
   // In src/app/lib/reearth-ui/components/index.ts
   export * from "./NewComponent";
   ```

This ensures consistency across the component library and maintains the high quality standards of the Re:Earth UI system.
