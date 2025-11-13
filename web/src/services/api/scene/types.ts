import { Scene as GqlScene } from "../../gql";
import type { PluginExtensionType } from "../plugin";

export type ScenePropertyCollection =
  | "main"
  | "tiles"
  | "terrain"
  | "globe"
  | "sky"
  | "camera";

export type ScenePlugin = {
  id?: string;
  name?: string;
  extensions?: SceneExtension[];
};
export type SceneExtension = {
  id: string;
  extensionId: string;
  name?: string;
  description?: string;
  type?: PluginExtensionType;
};

export type SceneQueryProps = {
  sceneId?: string;
  lang?: string;
  pollInterval?: number;
};

export type Scene = Omit<
  GqlScene,
  | "clusters"
  | "tags"
  | "createdAt"
  | "datasetSchemas"
  | "tags"
  | "tagIds"
  | "updatedAt"
  | "workspaceId"
  | "propertyId"
  | "project"
  | "workspace"
  | "rootLayer"
  | "__typename"
> & {
  workspaceId: string;
};
