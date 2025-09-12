import { LayerAppearanceTypes } from "@reearth/core";

export type LayerStyle = {
  id: string;
  name: string;
  value?: Partial<LayerAppearanceTypes>;
};
