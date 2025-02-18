import { PhotoOverlayEditingFeature } from "@reearth/beta/utils/sketch";
import { atomWithReset } from "jotai/utils";

export const photoOverlayEditingFeatureAtom = atomWithReset<
  PhotoOverlayEditingFeature | undefined
>(undefined);
