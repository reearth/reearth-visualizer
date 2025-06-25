import { Theme } from "@reearth/app/features/Visualizer/Crust/types";
import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import type { ComputedFeature, FlyTo, Layer } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";

export type InstallableBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: string;
};

export type BlockProps<T = any> = {
  block?: T;
  layer?: Layer;
  onClick?: () => void;
  onBlockDoubleClick?: () => void;
  nlsLayers?: NLSLayer[];
};

export type CommonBlockProps<T = any> = {
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
