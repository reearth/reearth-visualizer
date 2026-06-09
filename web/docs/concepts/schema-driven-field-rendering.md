---
title: "Schema-Driven Field Rendering"
category: "concept"
tags: ["ui", "property", "schema", "forms", "rendering"]
last_updated: "2026-06-04"
related:
  - "../modules/ui/components.md"
  - "./feature-flags.md"
maintainers: []
---

# Schema-Driven Field Rendering

## Overview

Re:Earth Visualizer uses a **schema-driven approach** for rendering property fields throughout the application. Instead of manually coding UI components for each property type, the system automatically generates appropriate field components based on property schema definitions provided by the backend API.

This approach enables:
- **Declarative UI**: Define fields through data structures, not code
- **Consistency**: All property panels use the same rendering system
- **Flexibility**: Backend controls field types and validation without frontend changes
- **Maintainability**: Single rendering system serves all properties across the app

## Core Principles

1. **Backend Defines Schema, Frontend Renders UI**: The backend provides field definitions (type, constraints, choices) and the frontend automatically selects and renders appropriate UI components

2. **Type-Driven Component Selection**: Field components are selected based on `schema.type` and optional `schema.ui` hints, ensuring consistent mapping from data types to UI controls

3. **Separation of Concerns**: Schema mapping logic (PropertyField) is separate from individual field implementations (SelectField, NumberField, etc.), allowing each to evolve independently

## Key Concepts

### Schema Structure

A schema defines the structure and constraints of a property:

```typescript
type SchemaField = {
  id: string;                    // Unique identifier
  type: FieldType;               // Data type: string, number, bool, etc.
  title: string;                 // Display label
  description?: string;          // Help text
  ui?: UIType;                   // UI hint: color, slider, multiline, etc.

  // Constraints
  min?: number;
  max?: number;
  placeholder?: string;
  suffix?: string;               // Unit suffix (e.g., "px", "%")

  // Options
  choices?: Array<{
    key: string;
    label?: string;
  }>;

  // Defaults
  defaultValue?: ValueTypes;

  // Conditional visibility
  only?: {
    field: string;               // Show only when this field...
    value: ValueTypes;           // ...has this value
  };
};
```

### Type-to-Component Mapping

The system maps schema types to UI components:

| Schema Type | UI Hint | Component |
|-------------|---------|-----------|
| `string` | (none) | InputField |
| `string` | `color` | ColorField |
| `string` | `datetime` | TimePointField |
| `string` | `selection` or has `choices` | SelectField |
| `string` | `multiline` | TextareaField |
| `number` | (none) | NumberField |
| `number` | `slider` | SliderField |
| `bool` | (none) | SwitchField |
| `url` | `image` | AssetField (image) |
| `url` | `file` | AssetField (file) |
| `url` | `video` | AssetField (video/URL) |
| `latlng` | (none) | TwinInputField |
| `camera` | (none) | CameraField |
| `spacing` | (none) | SpacingField |
| `timeline` | (none) | TimePeriodField |
| `array` | `zoomLevel` | ZoomLevelField |
| `array` | `range` | RangeField |

### Value Resolution

Property values are resolved with a fallback chain:

```typescript
const value = field?.mergedValue ?? field?.value ?? schema.defaultValue;
```

- **mergedValue**: Value with plugin/override merges applied
- **value**: User-set value from the property
- **defaultValue**: Schema-defined default

This allows property overrides (e.g., from plugins) without modifying the underlying value.

## How It Works

### Data Flow

```
1. User selects a layer/widget/block
        ↓
2. GraphQL query fetches property schema
        ↓
3. PropertyItem receives schema + current values
        ↓
4. For each schemaField:
   - Check conditional visibility (schema.only)
   - Pass to PropertyField component
        ↓
5. PropertyField:
   - Resolves value (mergedValue ?? value ?? defaultValue)
   - Selects component based on type + ui hint
   - Passes props to selected field component
        ↓
6. Field component (e.g., SelectField):
   - Wraps input with CommonField (title + description)
   - Renders actual input control
   - Handles user interaction
        ↓
7. On change:
   - Field calls onChange handler
   - PropertyField updates property via GraphQL mutation
   - Backend validates and saves
```

### Component Hierarchy

```
PropertyItem (Properties/index.tsx)
  │
  ├─→ Handles list vs single item
  ├─→ Manages selected item state
  ├─→ Computes conditional visibility
  │
  └─→ Maps schemaFields to PropertyField components
         │
         PropertyField (Properties/PropertyField.tsx)
           │
           ├─→ Resolves value with fallback
           ├─→ Selects component: schema.type + schema.ui → Component
           ├─→ Computes decorations (upcoming feature)
           │
           └─→ Renders field component
                  │
                  Field Component (e.g., SelectField)
                    │
                    └─→ Wraps with CommonField
                           │
                           ├─→ Renders title
                           ├─→ Renders input control
                           └─→ Renders description
```

## Implementation Across the Codebase

### In UI Layer

**PropertyItem Component** - Orchestrates property rendering

**Code Reference**: `src/app/ui/fields/Properties/index.tsx:25`

Responsibilities:
- Distinguishes between list items (`items[]`) and single groups
- Manages selection state for lists
- Computes field visibility based on `schema.only` conditions
- Provides CRUD hooks (add, delete, move, update)

**PropertyField Component** - Maps schema to components

**Code Reference**: `src/app/ui/fields/Properties/PropertyField.tsx:39`

Core logic:
```typescript
// Type + UI hint determines component
{schema.type === "string" ? (
  schema.ui === "datetime" ? (
    <TimePointField {...props} />
  ) : schema.ui === "color" ? (
    <ColorField {...props} />
  ) : schema.ui === "selection" || schema.choices ? (
    <SelectField {...props} />
  ) : schema.ui === "multiline" ? (
    <TextareaField {...props} />
  ) : (
    <InputField {...props} />
  )
) : schema.type === "number" ? (
  schema.ui === "slider" ? (
    <SliderField {...props} />
  ) : (
    <NumberField {...props} />
  )
) : ...}
```

**CommonField Component** - Consistent field wrapper

**Code Reference**: `src/app/ui/fields/CommonField/index.tsx:12`

Provides standard layout:
```
┌─────────────────────┐
│ Title               │  ← Typography (size: body)
├─────────────────────┤
│ [Input Component]   │  ← children
├─────────────────────┤
│ Description         │  ← Typography (size: footnote, weak color)
└─────────────────────┘
```

**Individual Field Components**

**Code Reference**: `src/app/ui/fields/`

Each field component:
- Accepts value, onChange, title, description props
- Wraps input with CommonField
- Implements specific input behavior
- Handles validation and constraints

Example:
```typescript
// SelectField/index.tsx
const SelectorField: FC<SelectorFieldProps> = ({
  title,
  description,
  ...props
}) => (
  <CommonField title={title} description={description}>
    <Selector {...props} />
  </CommonField>
);
```

### In Features Layer

**Property Panels** - Main consumers

**Code Reference**: `src/app/features/Visualizer/Crust/Widgets/PropertyPane/`

Usage:
```typescript
<PropertyItem
  propertyId={layer.propertyId}
  item={propertyItem}
  onFlyTo={handleFlyTo}
/>
```

Properties rendered:
- Layer properties (3D Tiles, GeoJSON, Imagery, Terrain)
- Widget properties (Navigation, Timeline, Legend)
- Story block properties (Text, Image, Video, Timeline)
- Scene settings (Background, Atmosphere, Camera)

### In Services Layer

**GraphQL Schema Queries**

**Code Reference**: `src/services/gql/fragments/property.ts`

Backend provides property schemas via GraphQL:
```graphql
fragment PropertyFragment on Property {
  id
  schemaGroup
  schemaFields {
    id
    type
    title
    description
    ui
    min
    max
    choices {
      key
      label
      title
    }
    defaultValue
    only {
      field
      value
    }
  }
  fields {
    id
    type
    value
    mergedValue
  }
}
```

## Best Practices

### Do's ✅

- **Define in schema when possible**: If a UI requirement can be expressed in schema (type, constraints, choices), define it there rather than hardcoding in components

- **Use value resolution chain**: Always respect the fallback: `mergedValue ?? value ?? defaultValue` to support property overrides

- **Memoize expensive computations**: Use `useMemo` for computed decorations or filtered options to avoid unnecessary recalculations

- **Leverage conditional visibility**: Use `schema.only` for field dependencies instead of hiding fields with CSS

- **Extract reusable decorations**: Create shared components (WarningBanner, Badge) for common UI decorations

### Don'ts ❌

- **Don't hardcode field types**: Never check field IDs to decide component type; always use `schema.type` and `schema.ui`

- **Don't skip CommonField**: All field components should wrap their input with CommonField for consistent layout

- **Don't mutate schema**: Schema is read-only; compute derived values in useMemo, don't modify schema objects

- **Don't mix presentation with mapping**: PropertyField should only map types to components, not contain complex business logic

- **Don't add backend-only concerns to frontend**: Validation rules, default values, and constraints belong in schema, not hardcoded in UI

## Common Patterns

### Pattern 1: Conditional Field Visibility

**Use Case**: Show field B only when field A has a specific value

**Implementation**:

Schema definition:
```typescript
{
  schemaFields: [
    {
      id: "mode",
      type: "string",
      title: "Mode",
      choices: [
        { key: "simple", label: "Simple" },
        { key: "advanced", label: "Advanced" }
      ]
    },
    {
      id: "advanced_setting",
      type: "number",
      title: "Advanced Setting",
      only: {
        field: "mode",
        value: "advanced"
      }
    }
  ]
}
```

PropertyItem handles visibility:
```typescript
const hidden = f.only && (!condv || condv !== f.only.value);

if (hidden) return null;
```

**Benefits**:
- Declarative dependencies in schema
- No custom visibility logic in components
- Backend controls field relationships

**Trade-offs**:
- Limited to simple value equality checks
- Complex conditions need alternative approaches

### Pattern 2: Representative Field for Lists

**Use Case**: Display one field value as the item title in lists

**Implementation**:

Schema definition:
```typescript
{
  representativeField: "name",
  items: [
    {
      id: "item1",
      fields: [
        { id: "name", value: "First Item" },
        { id: "enabled", value: true }
      ]
    },
    {
      id: "item2",
      fields: [
        { id: "name", value: "Second Item" },
        { id: "enabled", value: false }
      ]
    }
  ]
}
```

PropertyItem renders list:
```typescript
const representativeField = item?.representativeField
  ? i.fields.find(f => f.id === item.representativeField)
  : undefined;

const title = valueToString(representativeField?.value) ?? t("Settings");

return {
  id: i.id,
  title  // "First Item", "Second Item"
};
```

**Benefits**:
- Consistent list display logic
- Backend controls which field is prominent
- Falls back gracefully to "Settings" if missing

**Code Reference**: `src/app/ui/fields/Properties/index.tsx:56`

### Pattern 3: Default Value Override from Config

**Use Case**: Enterprise editions override default values without schema changes

**Implementation**:

PropertyField value resolution:
```typescript
const value = useMemo(() => {
  // Special handling for configurable defaults
  if (schema.id === "tile_type" && schemaGroup === "tiles") {
    const overriddenDefault = appFeature()?.defaultTileType;
    return (
      field?.mergedValue ??
      field?.value ??
      overriddenDefault ??
      schema.defaultValue
    );
  }

  // Standard resolution
  return field?.mergedValue ?? field?.value ?? schema.defaultValue;
}, [field, schema, schemaGroup]);
```

**Benefits**:
- App configuration controls defaults
- No schema changes needed for EE features
- Graceful fallback to schema default

**Trade-offs**:
- Special-case logic in PropertyField
- Must call `appFeature()` in component (not at module level)

**Code Reference**: `src/app/ui/fields/Properties/PropertyField.tsx:49`

### Pattern 4: Filtering Choices by Config

**Use Case**: Hide certain options based on application configuration

**Implementation**:

PropertyField computes filtered options:
```typescript
const filteredOptions = useMemo(() => {
  if (!schema.choices) return [];

  // Special filtering for tile types
  if (schema.id === "tile_type" && schemaGroup === "tiles") {
    const disabledTileTypes = appFeature()?.disabledTileTypes || [];

    return schema.choices
      .filter(choice => !disabledTileTypes.includes(choice.key))
      .map(({ key, label }) => ({ value: key, label }));
  }

  // Return all choices for other fields
  return schema.choices.map(({ key, label }) => ({ value: key, label }));
}, [schema.choices, schema.id, schemaGroup]);
```

**Benefits**:
- Enterprise editions hide unavailable options
- Configuration-driven without schema changes
- Transparent to field components

**Code Reference**: `src/app/ui/fields/Properties/PropertyField.tsx:81`

## Anti-Patterns

### Anti-Pattern 1: Hardcoding Field-Specific Logic by ID

**Problem**: Checking field IDs to determine behavior couples UI to specific schemas

**Example** ❌:
```typescript
// BAD: Hardcoded field ID check
if (schema.id === "my_special_field") {
  return <CustomField {...props} />;
}
```

**Better Approach** ✅:
```typescript
// GOOD: Use schema type and UI hint
if (schema.type === "string" && schema.ui === "custom") {
  return <CustomField {...props} />;
}
```

Add `ui: "custom"` to schema instead of checking field ID.

### Anti-Pattern 2: Modifying Schema Objects

**Problem**: Schema is immutable data from backend; modifying it breaks caching and causes bugs

**Example** ❌:
```typescript
// BAD: Mutating schema
schema.choices = schema.choices.filter(c => c.key !== "disabled");
```

**Better Approach** ✅:
```typescript
// GOOD: Compute filtered array
const filteredOptions = useMemo(
  () => schema.choices?.filter(c => c.key !== "disabled") || [],
  [schema.choices]
);
```

### Anti-Pattern 3: Calling `appFeature()` at Module Level

**Problem**: `appFeature()` must only be called at runtime (in components/hooks), not during module initialization

**Example** ❌:
```typescript
// BAD: Called during module load
const { defaultTileType } = appFeature();

const getDefaultValue = (schema) => {
  return defaultTileType ?? schema.defaultValue;
};
```

**Better Approach** ✅:
```typescript
// GOOD: Called inside component
const PropertyField = ({ schema }) => {
  const value = useMemo(() => {
    const config = appFeature();  // Called at runtime
    return config.defaultTileType ?? schema.defaultValue;
  }, [schema.defaultValue]);

  // ...
};
```

See `appFeature()` documentation for more details.

**Code Reference**: `src/services/config/appFeatureConfig.ts`

## Examples

### Example 1: Adding a New Field Type

**Context**: Backend adds a new `date-range` type for time-based filtering

**Solution**:

1. Update type mapping in PropertyField:

```typescript
// PropertyField.tsx
{schema.type === "date-range" ? (
  <DateRangeField
    key={schema.id}
    title={schema.title}
    value={value as DateRange}
    description={schema.description}
    onChange={handleChange}
  />
) : ...}
```

2. Create field component:

```typescript
// DateRangeField/index.tsx
export type DateRangeFieldProps = CommonFieldProps & {
  value: DateRange;
  onChange: (value: DateRange) => void;
};

const DateRangeField: FC<DateRangeFieldProps> = ({
  title,
  description,
  value,
  onChange
}) => (
  <CommonField title={title} description={description}>
    <DateRangePicker value={value} onChange={onChange} />
  </CommonField>
);
```

3. Backend provides schema:

```typescript
{
  id: "time_filter",
  type: "date-range",
  title: "Time Filter",
  description: "Filter data by date range"
}
```

**Explanation**: The schema-driven system automatically picks up new types when PropertyField mapping is updated. All existing property panels now support date-range fields without modification.

### Example 2: Adding Conditional Warning Decoration

**Context**: Display warning when Cesium Ion tile type is selected but no token is configured

**Solution**:

1. Compute decoration in PropertyField:

```typescript
const decorations = useMemo(() => {
  const result: Partial<CommonFieldProps> = {};

  if (
    schema.id === "tile_type" &&
    schemaGroup === "tiles" &&
    value === "cesium-ion"
  ) {
    result.beforeInput = (
      <WarningBanner>
        <WarningIcon />
        Cesium Ion access token is required for this tile type
      </WarningBanner>
    );
  }

  return result;
}, [schema.id, schemaGroup, value]);
```

2. Pass to field component:

```typescript
<SelectField
  title={schema.title}
  value={value as string}
  onChange={handleChange}
  {...decorations}
/>
```

3. SelectField passes to CommonField:

```typescript
const SelectorField: FC<SelectorFieldProps> = ({
  title,
  description,
  beforeInput,  // From decorations
  ...props
}) => (
  <CommonField
    title={title}
    description={description}
    beforeInput={beforeInput}
  >
    <Selector {...props} />
  </CommonField>
);
```

**Explanation**: Decorations are computed based on runtime context (schema + value) and passed through the component chain. CommonField renders them in predefined slots.

## Integration Points

### With Property API

**Code Reference**: `src/services/api/property/`

Property API provides:
- `useProperty(id)` - Fetch property with schema + values
- `useUpdateProperty()` - Update property values
- Type definitions for Property, SchemaField, Field

PropertyItem uses these hooks:
```typescript
const { property } = useProperty(propertyId);
const { updateProperty } = useUpdateProperty();

// Pass schema to PropertyField
<PropertyField schema={schemaField} onUpdate={updateProperty} />
```

### With GraphQL Layer

**Code Reference**: `src/services/gql/`

GraphQL provides property queries and mutations:
- Fragments for Property, SchemaField, Field
- Code-generated types
- Apollo cache integration

Property updates flow:
```
User edits field
  → onChange handler
  → updateProperty mutation
  → GraphQL request
  → Backend validation
  → Cache update
  → UI re-renders with new value
```

### With Feature Flags

**Code Reference**: `src/services/config/appFeatureConfig.ts`

Feature flags control:
- Default values (e.g., `defaultTileType`)
- Available choices (e.g., `disabledTileTypes`)
- Field decorations (warnings, badges)

**Important**: Always call `appFeature()` inside components, never at module level.

### With Plugin System

**Code Reference**: `src/app/features/Visualizer/utils/useOverriddenProperty.ts`

Plugins can override property values:
- `mergedValue` contains plugin overrides
- Original `value` is preserved
- PropertyField always uses `mergedValue` first

This allows plugins to temporarily modify properties without saving changes.

## Testing Strategies

### Unit Testing Schema Mapping

Test that PropertyField selects correct components:

```typescript
describe("PropertyField - Type Mapping", () => {
  it("renders SelectField for string with choices", () => {
    const schema: SchemaField = {
      id: "test",
      type: "string",
      title: "Test Field",
      choices: [
        { key: "option1", label: "Option 1" },
        { key: "option2", label: "Option 2" }
      ]
    };

    render(
      <PropertyField
        propertyId="test"
        schemaGroup="test"
        schema={schema}
      />
    );

    expect(screen.getByText("Test Field")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders NumberField for number type", () => {
    const schema: SchemaField = {
      id: "test",
      type: "number",
      title: "Count",
      min: 0,
      max: 100
    };

    render(
      <PropertyField
        propertyId="test"
        schemaGroup="test"
        schema={schema}
      />
    );

    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });
});
```

### Testing Value Resolution

Test the fallback chain:

```typescript
describe("PropertyField - Value Resolution", () => {
  it("uses mergedValue over value", () => {
    const schema: SchemaField = {
      id: "test",
      type: "string",
      defaultValue: "default"
    };

    const field: Field = {
      id: "test",
      type: "string",
      value: "user-value",
      mergedValue: "override-value"
    };

    render(
      <PropertyField
        propertyId="test"
        schemaGroup="test"
        schema={schema}
        field={field}
      />
    );

    expect(screen.getByDisplayValue("override-value")).toBeInTheDocument();
  });

  it("falls back to defaultValue when no value", () => {
    const schema: SchemaField = {
      id: "test",
      type: "string",
      defaultValue: "default"
    };

    render(
      <PropertyField
        propertyId="test"
        schemaGroup="test"
        schema={schema}
      />
    );

    expect(screen.getByDisplayValue("default")).toBeInTheDocument();
  });
});
```

### Testing Conditional Visibility

Test `schema.only` behavior:

```typescript
describe("PropertyItem - Conditional Visibility", () => {
  it("hides field when condition not met", () => {
    const item: Item = {
      id: "test",
      schemaGroup: "test",
      schemaFields: [
        {
          id: "mode",
          type: "bool",
          title: "Enable Advanced"
        },
        {
          id: "advanced",
          type: "string",
          title: "Advanced Setting",
          only: {
            field: "mode",
            value: true
          }
        }
      ],
      fields: [
        { id: "mode", type: "bool", value: false }
      ]
    };

    render(<PropertyItem propertyId="test" item={item} />);

    expect(screen.getByText("Enable Advanced")).toBeInTheDocument();
    expect(screen.queryByText("Advanced Setting")).not.toBeInTheDocument();
  });
});
```

**Code Reference**: `src/app/ui/fields/Properties/index.test.tsx`

## Performance Implications

### Memoization Requirements

PropertyField should memoize:
- **Value resolution** - Prevents recalculating on every render
- **Filtered options** - Avoids filtering arrays unnecessarily
- **Decorations** - Prevents creating new React elements on every render

```typescript
const value = useMemo(
  () => field?.mergedValue ?? field?.value ?? schema.defaultValue,
  [field?.mergedValue, field?.value, schema.defaultValue]
);

const filteredOptions = useMemo(
  () => schema.choices?.filter(...).map(...),
  [schema.choices]
);
```

### Avoid Inline Functions

Pass stable references to onChange handlers:

```typescript
// ✅ GOOD: Stable reference
const handleChange = useCallback(
  (value) => updateProperty(schema.id, value),
  [schema.id, updateProperty]
);

<SelectField onChange={handleChange} />

// ❌ BAD: New function on every render
<SelectField onChange={(v) => updateProperty(schema.id, v)} />
```

### List Rendering Optimization

For list properties with many items, PropertyItem uses:
- `useMemo` for item mapping
- Stable keys (item.id)
- Virtualization for very long lists (future enhancement)

## Security Considerations

### Input Validation

- **Client-side**: Field components validate format and constraints
- **Server-side**: Backend must validate all property updates
- Never trust client-validated data

### XSS Prevention

- Schema fields (`title`, `description`) are rendered as text, not HTML
- If `description` accepts ReactNode, ensure it's from trusted sources only
- User input values are always escaped by React

### Access Control

- Property mutations require authentication
- Backend enforces permissions (user can only edit their own properties)
- Frontend doesn't implement access control logic

## Troubleshooting

### Issue: "Field not rendering for new schema type"

**Symptoms**: PropertyField renders fallback `<p>` tag instead of field component

**Diagnosis**: Check browser console for:
```
<p>Field Name field</p>
```

This indicates no mapping exists for the schema type.

**Solution**: Add type mapping in PropertyField.tsx:

```typescript
{schema.type === "your-new-type" ? (
  <YourNewField
    key={schema.id}
    title={schema.title}
    value={value as YourType}
    onChange={handleChange}
  />
) : ...}
```

### Issue: "Value not updating after change"

**Symptoms**: User edits field but value reverts to previous state

**Diagnosis**: Check:
1. Is GraphQL mutation succeeding? (Network tab)
2. Is Apollo cache updating? (Apollo DevTools)
3. Is component using correct value source?

**Solution**:

Ensure PropertyField uses resolved value:
```typescript
// ✅ GOOD
const value = field?.mergedValue ?? field?.value ?? schema.defaultValue;

// ❌ BAD: Ignoring mergedValue
const value = field?.value ?? schema.defaultValue;
```

### Issue: "Conditional field not showing when it should"

**Symptoms**: Field with `schema.only` doesn't appear when condition is met

**Diagnosis**:
1. Check condition field exists in `fields` array
2. Verify condition value matches exactly (type matters: `true` !== `"true"`)
3. Check console for PropertyItem conditional logic

**Solution**:

Ensure condition field has a value:
```typescript
{
  schemaFields: [
    { id: "mode", type: "string", defaultValue: "simple" },  // Add default
    {
      id: "advanced",
      only: { field: "mode", value: "advanced" }
    }
  ]
}
```

### Issue: "`appFeature()` returning stale values"

**Symptoms**: Feature flag changes don't reflect in UI

**Diagnosis**: Check if `appFeature()` is called at module level instead of runtime

**Solution**: Move call inside component:

```typescript
// ❌ BAD: Module-level
const { defaultTileType } = appFeature();

const Component = () => {
  return defaultTileType;  // Stale value
};

// ✅ GOOD: Runtime
const Component = () => {
  const { defaultTileType } = appFeature();  // Fresh value
  return defaultTileType;
};
```

**Code Reference**: `src/services/config/appFeatureConfig.ts`

## Related Documentation

- [UI Components](../modules/ui/components.md)
- [Feature Flags](./feature-flags.md)
- [State Management](../architecture/state-management.md)
- [GraphQL Integration](../guides/working-with-graphql.md)

## External Resources

- [React Declarative UI Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

## Code References

- `src/app/ui/fields/Properties/` - Property rendering system
- `src/app/ui/fields/CommonField/` - Field wrapper component
- `src/app/ui/fields/` - Individual field components
- `src/services/api/property/` - Property API integration
- `src/services/gql/fragments/property.ts` - GraphQL property schema

## Changelog

### 2026-06-04 - Initial Documentation

- Created comprehensive concept documentation for schema-driven rendering
- Documented core principles, patterns, and anti-patterns
- Added code references and examples
- Documented upcoming decoration slot feature
