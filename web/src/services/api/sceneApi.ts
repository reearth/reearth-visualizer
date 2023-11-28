import { useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

import { Scene as GqlScene } from "../gql";

import { PluginExtensionType } from "./pluginsApi";

export type ScenePropertyCollection = "main" | "tiles" | "terrain" | "globe" | "sky" | "camera";

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
  | "teamId"
  | "propertyId"
  | "project"
  | "team"
  | "rootLayer"
  | "__typename"
> & {
  workspaceId: string;
};

export default () => {
  const useSceneQuery = useCallback(({ sceneId, lang }: SceneQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const scene = useMemo(() => {
      return data?.node?.__typename === "Scene"
        ? ({
            id: data.node.id,
            plugins: data.node.plugins,
            projectId: data.node.projectId,
            property: data.node.property,
            rootLayerId: data.node.rootLayerId,
            newLayers: data.node.newLayers,
            stories: data.node.stories,
            styles: data.node.styles,
            workspaceId: data.node.teamId,
            widgetAlignSystem: data.node.widgetAlignSystem,
            widgets: data.node.widgets,
          } as Scene)
        : undefined;
    }, [data]);

    return { scene, ...rest };
  }, []);

  return {
    useSceneQuery,
  };
};
