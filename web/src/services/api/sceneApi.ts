import { useQuery } from "@apollo/client";
import { useCallback } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

import { Scene } from "../gql";

import { PluginExtensionType } from "./pluginsApi";

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
};

export default () => {
  const useSceneQuery = useCallback(({ sceneId, lang }: SceneQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const scene =
      data?.node?.__typename === "Scene"
        ? ({
            id: data.node.id,
            clusters: data.node.clusters,
            plugins: data.node.plugins,
            projectId: data.node.projectId,
            property: data.node.property,
            rootLayerId: data.node.rootLayerId,
            tags: data.node.tags,
            teamId: data.node.teamId,
            widgetAlignSystem: data.node.widgetAlignSystem,
            widgets: data.node.widgets,
          } as Scene)
        : undefined;

    return { scene, ...rest };
  }, []);

  return {
    useSceneQuery,
  };
};
