import {
  PhotoOverlayEditingFeature,
  PhotoOverlayPreview
} from "@reearth/beta/utils/sketch";
import { atomWithReset } from "jotai/utils";

export const photoOverlayEditingFeatureAtom = atomWithReset<
  PhotoOverlayEditingFeature | undefined
>(undefined);

export const PhotoOverlayPreviewAtom = atomWithReset<
  PhotoOverlayPreview | undefined
>(undefined);
