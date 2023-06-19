import { MAP_FEATURE_FLAGS } from "../Map/featureFlags";

export type InteractionModeType = "default" | "move" | "selection" | "sketch";

// If you would like enable a feature in a specific mode,
// just set the feature's flag here to that mode.
export const INTERACTION_MODES: Record<InteractionModeType, number> = {
  default:
    MAP_FEATURE_FLAGS.CAMERA_MOVE |
    MAP_FEATURE_FLAGS.CAMERA_ZOOM |
    MAP_FEATURE_FLAGS.SINGLE_SELECTION,
  move: MAP_FEATURE_FLAGS.CAMERA_MOVE | MAP_FEATURE_FLAGS.CAMERA_ZOOM,
  selection: MAP_FEATURE_FLAGS.MULTIPLE_SELECTION | MAP_FEATURE_FLAGS.CAMERA_ZOOM,
  sketch: MAP_FEATURE_FLAGS.SKETCH | MAP_FEATURE_FLAGS.CAMERA_ZOOM,
};
