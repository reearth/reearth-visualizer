import { Theme } from "@reearth/beta/lib/core/Crust/types";
import type { Layer } from "@reearth/beta/lib/core/mantle";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";

export type Block<P = unknown> = {
  id: string;
  name?: string;
  pluginId?: string;
  extensionId?: string;
  propertyId?: string;
  property?: P;
};

export type BlockProps<P = unknown> = {
  block?: Block<P>;
  layer?: Layer;
  onClick?: () => void;
};

export type CommonProps = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  block?: Block<any>;
  theme?: Theme;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: (pageId?: string, id?: string) => void;
  onChange?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
};

export type SharedProperties = {
  id: string;
  title: string;
  fields: {
    padding?: Spacing;
  };
}[];

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};
