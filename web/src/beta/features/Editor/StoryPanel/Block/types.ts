import { Theme } from "@reearth/beta/lib/core/Crust/types";
import type { Layer } from "@reearth/beta/lib/core/mantle";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";

export type Block<P = unknown> = {
  id: string;
  title?: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type BlockProps<P = unknown> = {
  block?: Block<P>;
  layer?: Layer;
  onClick?: () => void;
};

export type CommonProps<BP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  block?: Block<BP>;
  // infoboxProperty?: InfoboxProperty;
  theme?: Theme;
  onClick?: () => void;
  onRemove?: (id?: string) => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};
