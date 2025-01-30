import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { LayerAddProps } from "../../hooks/useLayers";

export type CustomPropertyProp = Record<string, string>;
export type SketchLayerDataType =
  | "Text"
  | "TextArea"
  | "URL"
  | "Asset"
  | "Float"
  | "Int"
  | "Boolean";

export type PropertyListProp = {
  id: string;
  key: string;
  value: string;
};

export type CustomPropertyProps = {
  isSketchLayerEditor?: boolean;
  customProperties?: CustomPropertyProp[];
  propertiesList?: PropertyListProp[];
  setCustomProperties?: (prev: CustomPropertyProp[]) => void;
  setPropertiesList?: (prev: PropertyListProp[]) => void;
  warning?: boolean;
  setWarning?: (val: boolean) => void;
  setPreviousTitle?: (val: string) => void;
  setNewTitle?: (val: string) => void;
};

export type SketchLayerProps = {
  sceneId: string;
  layerStyles?: LayerStyle[];
  onClose?: () => void;
  onSubmit?: (layerAddInp: LayerAddProps) => void;
};

export type CustomPropertyItemProps = {
  customPropertyItem: PropertyListProp;
  isSketchLayerEditor?: boolean;
  isEditTitle?: boolean;
  handleClassName?: string;
  onTypeChange?: (v?: string | string[]) => void;
  onBlur?: (v?: string) => void;
  onDoubleClick?: (field: string) => void;
  onCustomPropertyDelete?: () => void;
};
