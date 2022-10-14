import { atom, useAtom } from "jotai";

import { Clock } from "@reearth/components/molecules/Visualizer/Plugin/types";
import { Camera } from "@reearth/util/value";

// useError is needed for Apollo provider error only. Handle other errors with useNotification directly.
const error = atom<string | undefined>(undefined);
export const useError = () => useAtom(error);

const sceneId = atom<string | undefined>(undefined);
export const useSceneId = () => useAtom(sceneId);

const rootLayerId = atom<string | undefined>(undefined);
export const useRootLayerId = () => useAtom(rootLayerId);

const widgetAlignEditor = atom<boolean | undefined>(undefined);
export const useWidgetAlignEditorActivated = () => useAtom(widgetAlignEditor);

export type Selected =
  | { type: "scene" }
  | { type: "layer"; layerId: string }
  | { type: "widgets" }
  | { type: "cluster"; clusterId: string }
  | { type: "widget"; widgetId?: string; pluginId: string; extensionId: string }
  | { type: "dataset"; datasetSchemaId: string };
const selected = atom<Selected | undefined>(undefined);
export const useSelected = () => useAtom(selected);

const zoomedLayerId = atom<string | undefined>(undefined);
export const useZoomedLayerId = () => useAtom(zoomedLayerId);

const selectedBlock = atom<string | undefined>(undefined);
export const useSelectedBlock = () => useAtom(selectedBlock);

const isCapturing = atom<boolean>(false);
export const useIsCapturing = () => useAtom(isCapturing);

const camera = atom<Camera | undefined>(undefined);
export const useCamera = () => useAtom(camera);

const clock = atom<Clock | undefined>(undefined);
export const useClock = () => useAtom(clock);

export type SceneMode = "3d" | "2d" | "columbus";
const sceneMode = atom<SceneMode>("3d");
export const useSceneMode = () => useAtom(sceneMode);

export type Team = {
  id: string;
  name: string;
  members?: Array<any>;
  assets?: any;
  projects?: any;
  personal?: boolean;
};
const team = atom<Team | undefined>(undefined);
export const useTeam = () => useAtom(team);

export type Project = {
  id: string;
  name: string;
  sceneId?: string;
  isArchived?: boolean;
};
const project = atom<Project | undefined>(undefined);
export const useProject = () => useAtom(project);

export type NotificationType = "error" | "warning" | "info" | "success";

export type Notification = {
  type: NotificationType;
  heading?: string;
  text: string;
};
const notification = atom<Notification | undefined>(undefined);
export const useNotification = () => useAtom(notification);

const unselectProject = atom(null, (_get, set) => {
  set(project, undefined);
  set(team, undefined);
  set(sceneId, undefined);
  set(selected, undefined);
  set(selectedBlock, undefined);
  set(camera, undefined);
  set(isCapturing, false);
  set(sceneMode, "3d");
});
export const useUnselectProject = () => useAtom(unselectProject)[1];

const currentTheme = atom<"light" | "dark">("dark");
export const useCurrentTheme = () => useAtom(currentTheme);
