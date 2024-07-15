import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { LayerAddProps } from "../../hooks/useLayers";

export type CustomPropertyProp = {
  [key: string]: string;
};

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
};

export type SketchLayerProps = {
  sceneId: string;
  layerStyles?: LayerStyle[];
  onClose: () => void;
  onSubmit?: (layerAddInp: LayerAddProps) => void;
};
