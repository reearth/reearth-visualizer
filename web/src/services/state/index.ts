import { atom, useAtom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export * from "./devPlugins";

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

export type WidgetAreaPadding = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

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
  members?: any[];
  assets?: any;
  projects?: any;
  personal?: boolean;
  policyId?: string | null;
  policy?: Policy | null;
};

const widgetAlignEditor = atom<boolean | undefined>(undefined);
export const useWidgetAlignEditorActivated = () => useAtom(widgetAlignEditor);

const selectedWidgetArea = atom<WidgetAreaState | undefined>(undefined);
export const useSelectedWidgetArea = () => useAtom(selectedWidgetArea);

// Misc
const notification = atom<Notification | undefined>(undefined);
export const useNotification = () => useAtom(notification);

const currentTheme = atom<"light" | "dark">("dark");
export const useCurrentTheme = () => useAtom(currentTheme);

const workspace = atom<Workspace | undefined>(undefined);
export const useWorkspace = () => useAtom(workspace);

const userId = atomWithStorage<string | undefined>("userId", undefined);
export const useUserId = () => useAtom(userId);

// Record active requests (queries & mutaions)
export type GQLTask = {
  id: string;
};

const activeGQLTasksAtom = atom<GQLTask[]>([]);

const addGQLTaskAtom = atom(null, (_get, set, task: GQLTask) => {
  set(activeGQLTasksAtom, (prev) => [...prev, task]);
});

const removeGQLTaskAtom = atom(null, (_get, set, task: GQLTask) => {
  set(activeGQLTasksAtom, (prev) => prev.filter((t) => t.id !== task.id));
});

const hasActiveGQLTasksAtom = atom((get) => get(activeGQLTasksAtom).length > 0);

export const useAddGQLTask = () => useSetAtom(addGQLTaskAtom);
export const useRemoveGQLTask = () => useSetAtom(removeGQLTaskAtom);
export const useHasActiveGQLTasks = () => useAtom(hasActiveGQLTasksAtom);
