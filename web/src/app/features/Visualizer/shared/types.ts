import { Theme } from "@reearth/app/features/Visualizer/Crust/types";
import { ValueType, ValueTypes, Spacing } from "@reearth/app/utils/value";
import type { ComputedFeature, FlyTo, Layer } from "@reearth/core";
import type { NLSLayer } from "@reearth/services/api/layer";
import type { Field, SchemaField } from "@reearth/services/api/property";

export type InstallableBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockProps<T = any> = {
  // Blocks from plugins can have arbitrary structure
  block?: T;
  layer?: Layer;
  onClick?: () => void;
  onBlockDoubleClick?: () => void;
  nlsLayers?: NLSLayer[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommonBlockProps<T = any> = {
  // Blocks from plugins can have arbitrary structure
  pageId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  selectedFeature?: ComputedFeature;
  dragHandleClassName?: string;
  block?: T;
  layer?: Layer;
  theme?: Theme;
  padding?: {
    bottom: number;
    top: number;
    left?: number;
    right?: number;
  };
  minHeight?: number;
  onClick?: () => void;
  onBlockDoubleClick?: () => void;
  onClickAway?: () => void;
  onRemove?: (id?: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  onFlyTo?: FlyTo;
  nlsLayers?: NLSLayer[];
};

// Content Settings Types for dynamic form field configuration
export type ContentSettingsField = Partial<Field> &
  Partial<SchemaField> & {
    // Core properties that are commonly used in content settings
    value?: ValueTypes[ValueType];
    type: ValueType;
    title?: string;
    description?: string;
    ui?: SchemaField["ui"];
    min?: number;
    max?: number;
    choices?: SchemaField["choices"];
  };

export type ContentSettings = Record<string, ContentSettingsField>;

// Common content settings patterns
export type BlockContentSettings = {
  padding?: ContentSettingsField & {
    type: "spacing";
    ui?: "padding";
    value?: ValueTypes["spacing"];
  };
  margin?: ContentSettingsField & {
    type: "spacing";
    ui?: "margin";
    value?: ValueTypes["spacing"];
  };
  backgroundColor?: ContentSettingsField & {
    type: "string";
    ui?: "color";
    value?: string;
  };
};

export type PageContentSettings = {
  padding?: ContentSettingsField & {
    type: "spacing";
    ui?: "padding";
    value?: ValueTypes["spacing"];
  };
  gap?: ContentSettingsField & {
    type: "number";
    value?: number;
    min?: number;
    max?: number;
  };
  backgroundColor?: ContentSettingsField & {
    type: "string";
    ui?: "color";
    value?: string;
  };
};

// Block Property Types

/**
 * Common panel property structure used across Story Panel blocks
 *
 * This type represents the standardized panel configuration used by various
 * Story Panel components including Timeline blocks, Text blocks, and other
 * builtin blocks through BlockWrapper.
 *
 * Common usage patterns:
 * - property.panel.padding.value (for Spacing configuration)
 * - property.panel.gap (for numeric spacing between elements)
 * - property.panel.* (for extensible panel-specific settings)
 */
export type PanelProperty = {
  padding?: {
    value?: Spacing;
    [key: string]: unknown;
  };
  gap?: number;
  [key: string]: unknown;
};

/**
 * Base property structure for builtin Story Panel blocks
 * 
 * This provides a common foundation for all builtin block properties,
 * extending the standard panel configuration with common block patterns.
 */
export type BuiltinBlockProperty = {
  panel?: PanelProperty;
  default?: Record<string, {
    value?: ValueTypes[ValueType];
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

/**
 * Camera block specific property structure
 */
export type CameraBlockProperty = BuiltinBlockProperty & {
  default?: {
    camera?: {
      value?: ValueTypes["camera"];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

/**
 * Text block specific property structure
 */
export type TextBlockProperty = BuiltinBlockProperty & {
  default?: {
    text?: {
      value?: string;
      [key: string]: unknown;
    };
    color?: {
      value?: string;
      [key: string]: unknown;
    };
    typography?: {
      value?: ValueTypes["typography"];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

/**
 * Link block specific property structure
 */
export type LinkBlockProperty = BuiltinBlockProperty & {
  default?: {
    title?: {
      value?: string;
      [key: string]: unknown;
    };
    url?: {
      value?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

/**
 * Layer block specific property structure
 */
export type LayerBlockProperty = BuiltinBlockProperty & {
  default?: {
    layers?: {
      value?: string[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

/**
 * Markdown block specific property structure
 */
export type MarkdownBlockProperty = BuiltinBlockProperty & {
  default?: {
    text?: {
      value?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

export type PaddingProp = {
  bottom: number;
  top: number;
  left?: number;
  right?: number;
};

export type BlockPanelProperty = {
  padding?: ContentSettingsField & {
    value?: ValueTypes["spacing"];
  };
  gap?: number;
};

export type BlockWrapperProperty = {
  title?: unknown;
  default?: unknown;
  panel?: PanelProperty;
  [key: string]: unknown;
};

// Debugging property types for development environments
export type DebuggableWidget = {
  __REEARTH_SOURCECODE?: string; // Plugin source code for debugging
};

export type DebuggableBlock = {
  __REEARTH_SOURCECODE?: string; // Plugin source code for debugging
};
