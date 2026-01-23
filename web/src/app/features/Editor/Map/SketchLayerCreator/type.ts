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
  customProperties?: CustomPropertyProp[];
  propertiesList?: PropertyListProp[];
  setCustomProperties?: (prev: CustomPropertyProp[]) => void;
  setPropertiesList?: (prev: PropertyListProp[]) => void;
  warning?: boolean;
  setWarning?: (val: boolean) => void;
};

export type SketchLayerProps = {
  sceneId: string;
  onClose?: () => void;
  onSubmit?: (layerAddInp: LayerAddProps) => void;
};

export type CustomPropertyItemProps = {
  customPropertyItem: PropertyListProp;
  isEditTitle?: boolean;
  isEditType?: boolean;
  handleClassName?: string;
  onTypeChange?: (v?: string | string[]) => void;
  onBlur?: (v?: string) => void;
  onDoubleClick?: (field: string) => void;
  onCustomPropertyDelete?: () => void;
};
