import { atom, useAtom } from "jotai";

import type { ComputedLayer, LayerSelectionReason } from "@reearth/beta/lib/core/Map";
import type { Camera } from "@reearth/beta/utils/value";

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
  featureId?: string;
  layer?: ComputedLayer;
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

// Selected
const selectedWidget = atom<SelectedWidget | undefined>(undefined);
export const useSelectedWidget = () => useAtom(selectedWidget);
const selectedWidgetArea = atom<WidgetAreaState | undefined>(undefined);
export const useSelectedWidgetArea = () => useAtom(selectedWidgetArea);
const selectedLayer = atom<SelectedLayer | undefined>(undefined);
export const useSelectedLayer = () => useAtom(selectedLayer);
const selectedStoryPageId = atom<SelectedStoryPageId | undefined>(undefined);
export const useSelectedStoryPageId = () => useAtom(selectedStoryPageId);

// Misc
const notification = atom<Notification | undefined>(undefined);
export const useNotification = () => useAtom(notification);

// Not sure we need belowNot sure we need belowNot sure we need belowNot sure we need below
// Not sure we need belowNot sure we need belowNot sure we need belowNot sure we need below
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
