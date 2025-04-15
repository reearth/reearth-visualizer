import { Geometry } from "@reearth/core";

import { Camera } from "./value";

export const BUILT_IN_REEARTH_PROPERTIES_NAME = "_reearth";
export const BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME = "photoOverlay";

// PhotoOverlay
export type PhotoOverlayValue = {
  camera?: Camera;
  url?: string;
  fill?: "contain" | "fixed";
  widthPct?: number;
  description?: string;
};

type BuiltinReearthPropertyValue = {
  [key in typeof BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME]?:
    | PhotoOverlayValue
    | undefined;
};

type Value =
  | string
  | number
  | boolean
  | undefined
  | BuiltinReearthPropertyValue;

type BuiltinReearthProperties = {
  [key in typeof BUILT_IN_REEARTH_PROPERTIES_NAME]: BuiltinReearthPropertyValue;
};

export type SketchFeatureProperties = Record<string, Value> &
  BuiltinReearthProperties;

export type PhotoOverlayPreview = {
  value?: PhotoOverlayValue;
  transparency?: number;
};

export type PhotoOverlayEditingFeature = {
  feature: {
    id: string;
    properties: SketchFeatureProperties;
    geometry: Geometry | undefined;
  };
  layerId: string;
  dataFeatureId: string;
};

export function getPhotoOverlayValue(
  properties: SketchFeatureProperties | undefined
): PhotoOverlayValue | undefined {
  return properties?.[BUILT_IN_REEARTH_PROPERTIES_NAME]?.[
    BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME
  ];
}

export function generateNewPropertiesWithPhotoOverlay(
  properties: SketchFeatureProperties,
  value: PhotoOverlayValue | undefined
): SketchFeatureProperties {
  return {
    ...properties,
    [BUILT_IN_REEARTH_PROPERTIES_NAME]: {
      ...properties[BUILT_IN_REEARTH_PROPERTIES_NAME],
      [BUILT_IN_PHOTO_OVERLAY_PROPERTY_NAME]: value
    }
  };
}

export type SketchFeatureTooltip = {
  description?: string;
};
