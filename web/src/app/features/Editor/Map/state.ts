import {
  PhotoOverlayEditingFeature,
  PhotoOverlayPreview,
  SketchFeatureTooltip
} from "@reearth/app/utils/sketch";
import { atomWithReset } from "jotai/utils";

export const photoOverlayEditingFeatureAtom = atomWithReset<
  PhotoOverlayEditingFeature | undefined
>(undefined);

export const PhotoOverlayPreviewAtom = atomWithReset<
  PhotoOverlayPreview | undefined
>(undefined);

export const SketchFeatureTooltipAtom = atomWithReset<
  SketchFeatureTooltip | undefined
>(undefined);

export const showDataSourceLayerCreatorAtom = atomWithReset<boolean>(false);
export const showPlateauAssetLayerCreatorAtom = atomWithReset<boolean>(false);
export const showSketchLayerCreatorAtom = atomWithReset<boolean>(false);
