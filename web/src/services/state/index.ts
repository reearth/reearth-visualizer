import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type {
  ComputedFeature,
  ComputedLayer,
  LayerSelectionReason,
} from "@reearth/beta/lib/core/Map";
import type { Camera } from "@reearth/beta/utils/value";
import { Clock } from "@reearth/classic/components/molecules/Visualizer/Plugin/types";
import { ProjectType } from "@reearth/types";

export { default as useSetError, useError } from "./gqlErrorHandling";

export type WidgetAreaState = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align?: WidgetAlignment;
  padding?: WidgetAreaPadding;
  gap?: number | null;
  centered?: boolean;
  background?: string;
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

export type SelectedLayer = {
  layerId: string;
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  layerSelectionReason?: LayerSelectionReason;
};

export type SelectedStoryPageId = string;

export type NotificationType = "error" | "warning" | "info" | "success";

export type Notification = {
  type: NotificationType;
  heading?: string;
  text: string;
  duration?: number | "persistent";
};

export type Policy = {
  id: string;
  name: string;
  projectCount?: number | null;
  memberCount?: number | null;
  publishedProjectCount?: number | null;
  layerCount?: number | null;
  assetStorageSize?: number | null;
  datasetSchemaCount?: number | null;
  datasetCount?: number | null;
};

export type Workspace = {
  id: string;
  name: string;
  members?: Array<any>;
  assets?: any;
  projects?: any;
  personal?: boolean;
  policyId?: string | null;
  policy?: Policy | null;
};

// Visualizer
const isVisualizerReady = atom<boolean>(false);
export const useIsVisualizerReady = () => useAtom(isVisualizerReady);
const currentCamera = atom<Camera | undefined>(undefined);
export const useCurrentCamera = () => useAtom(currentCamera);

const widgetAlignEditor = atom<boolean | undefined>(undefined);
export const useWidgetAlignEditorActivated = () => useAtom(widgetAlignEditor);

// Selected - map tab
const selectedLayer = atom<SelectedLayer | undefined>(undefined);
export const useSelectedLayer = () => useAtom(selectedLayer);
const selectedLayerStyle = atom<string | undefined>(undefined);
export const useSelectedLayerStyle = () => useAtom(selectedLayerStyle);
const selectedSceneSetting = atom<string | undefined>(undefined);
export const useSelectedSceneSetting = () => useAtom(selectedSceneSetting);

// Selected - story tab
const selectedStoryPageId = atom<SelectedStoryPageId | undefined>(undefined);
export const useSelectedStoryPageId = () => useAtom(selectedStoryPageId);

// Selected - widget tab
const selectedWidget = atom<SelectedWidget | undefined>(undefined);
export const useSelectedWidget = () => useAtom(selectedWidget);
const selectedWidgetArea = atom<WidgetAreaState | undefined>(undefined);
export const useSelectedWidgetArea = () => useAtom(selectedWidgetArea);

// Misc
const notification = atom<Notification | undefined>(undefined);
export const useNotification = () => useAtom(notification);

// --------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------
// Not sure we need below in Beta. Currently being used in classic.Not sure we need below in Beta. Currently being used in classic.
// Not sure we need below in Beta. Currently being used in classic.Not sure we need below in Beta. Currently being used in classic.
// --------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------

const isCapturing = atom<boolean>(false);
export const useIsCapturing = () => useAtom(isCapturing);

export type SceneMode = "3d" | "2d" | "columbus";
const sceneMode = atom<SceneMode>("3d");
export const useSceneMode = () => useAtom(sceneMode);

const selectedBlock = atom<string | undefined>(undefined);
export const useSelectedBlock = () => useAtom(selectedBlock);

const zoomedLayerId = atom<string | undefined>(undefined);
export const useZoomedLayerId = () => useAtom(zoomedLayerId);

const currentTheme = atom<"light" | "dark">("dark");
export const useCurrentTheme = () => useAtom(currentTheme);

const workspace = atom<Workspace | undefined>(undefined);
export const useWorkspace = () => useAtom(workspace);

const sceneId = atom<string | undefined>(undefined);
export const useSceneId = () => useAtom(sceneId);

const rootLayerId = atom<string | undefined>(undefined);
export const useRootLayerId = () => useAtom(rootLayerId);

export type Selected =
  | { type: "scene" }
  | {
      type: "layer";
      layerId: string;
      featureId?: string;
      layerSelectionReason?: LayerSelectionReason;
    }
  | { type: "widgets" }
  | { type: "cluster"; clusterId: string }
  | { type: "widget"; widgetId?: string; pluginId: string; extensionId: string }
  | { type: "dataset"; datasetSchemaId: string };

const selected = atom<Selected | undefined>(undefined);
export const useSelected = () => useAtom(selected);

const camera = atom<Camera | undefined>(undefined);
export const useCamera = () => useAtom(camera);

const clock = atom<Clock | undefined>(undefined);
export const useClock = () => useAtom(clock);

const userId = atomWithStorage<string | undefined>("userId", undefined);
export const useUserId = () => useAtom(userId);

export type Project = {
  id: string;
  name: string;
  sceneId?: string;
  isArchived?: boolean;
  projectType?: ProjectType;
};

const project = atom<Project | undefined>(undefined);
export const useProject = () => useAtom(project);

const unselectProject = atom(null, (_get, set) => {
  set(project, undefined);
  set(workspace, undefined);
  set(sceneId, undefined);
  set(selected, undefined);
  set(selectedBlock, undefined);
  set(camera, undefined);
  set(isCapturing, false);
  set(sceneMode, "3d");
});
export const useUnselectProject = () => useAtom(unselectProject)[1];
