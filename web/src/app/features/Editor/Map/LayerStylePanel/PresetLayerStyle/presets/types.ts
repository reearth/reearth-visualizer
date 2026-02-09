import { LayerAppearanceTypes } from "@reearth/core";

export type PresetStyle = {
  id: string;
  title: string;
  titleJa?: string;
  testId: string;
  style: Partial<LayerAppearanceTypes>;
};

export type PresetStyleCategory = {
  id: string;
  title: string;
  testId: string;
  subs: PresetStyle[];
};
