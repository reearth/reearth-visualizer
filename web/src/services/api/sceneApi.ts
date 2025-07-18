import { useLazyQuery, useQuery } from "@apollo/client";
import {
  CHECK_SCENE_ALIAS,
  GET_SCENE
} from "@reearth/services/gql/queries/scene";
import { useCallback, useMemo } from "react";

import {
  Scene as GqlScene,
  HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION
} from "../gql";
import { useLang, useT } from "../i18n";
import { useNotification } from "../state";

import { PluginExtensionType } from "./pluginsApi";

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
  const lang = useLang();
  const t = useT();
  const [, setNotification] = useNotification();

  const useSceneQuery = useCallback(
    ({ sceneId }: SceneQueryProps) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId
      });

      const scene = useMemo(() => {
        return data?.node?.__typename === "Scene"
          ? ({
              id: data.node.id,
              plugins: data.node.plugins,
              projectId: data.node.projectId,
              property: data.node.property,
              newLayers: data.node.newLayers,
              stories: data.node.stories,
              styles: data.node.styles,
              workspaceId: data.node.teamId,
              widgetAlignSystem: data.node.widgetAlignSystem,
              widgets: data.node.widgets
            } as Scene)
          : undefined;
      }, [data]);

      return { scene, ...rest };
    },
    [lang]
  );

  const [fetchCheckSceneAlias] = useLazyQuery(CHECK_SCENE_ALIAS, {
    fetchPolicy: "network-only" // Disable caching for this query
  });

  const checkSceneAlias = useCallback(
    async (alias: string, projectId?: string) => {
      if (!alias) return null;

      const { data, errors } = await fetchCheckSceneAlias({
        variables: { alias, projectId },
        errorPolicy: "all",
        context: {
          headers: {
            [HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION]: "true"
          }
        }
      });

      if (errors || !data?.checkSceneAlias) {
        return { status: "error", errors };
      }

      setNotification({
        type: "success",
        text: t("Successfully checked alias!")
      });
      return {
        available: data?.checkSceneAlias.available,
        alias: data?.checkSceneAlias.alias,
        status: "success"
      };
    },
    [fetchCheckSceneAlias, setNotification, t]
  );

  return {
    useSceneQuery,
    checkSceneAlias
  };
};
