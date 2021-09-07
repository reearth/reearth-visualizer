import { atom, useAtom } from "jotai";

import { Camera } from "@reearth/util/value";

const error = atom<string | undefined>(undefined);
export const useError = () => useAtom(error);

const sceneId = atom<string | undefined>(undefined);
export const useSceneId = () => useAtom(sceneId);

const rootLayerId = atom<string | undefined>(undefined);
export const useRootLayerId = () => useAtom(rootLayerId);

export type Selected =
  | { type: "scene" }
  | { type: "layer"; layerId: string }
  | { type: "widget"; widgetId?: string; pluginId: string; extensionId: string };
const selected = atom<Selected | undefined>(undefined);
export const useSelected = () => useAtom(selected);

const selectedBlock = atom<string | undefined>(undefined);
export const useSelectedBlock = () => useAtom(selectedBlock);

const isCapturing = atom<boolean>(false);
export const useIsCapturing = () => useAtom(isCapturing);

const camera = atom<Camera | undefined>(undefined);
export const useCamera = () => useAtom(camera);

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

export type Notification = { type: "error" | "warning" | "info" | "success"; text: string };
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
});
export const useUnselectProject = () => useAtom(unselectProject)[1];
