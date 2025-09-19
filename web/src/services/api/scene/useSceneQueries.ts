import { useLazyQuery, useQuery } from "@apollo/client";
import {
  CHECK_SCENE_ALIAS,
  GET_SCENE
} from "@reearth/services/gql/queries/scene";
import { useCallback, useMemo } from "react";

import { HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION } from "../../gql";
import { useLang, useT } from "../../i18n";
import { useNotification } from "../../state";

import { Scene, SceneQueryProps } from "./types";

export const useScene = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();

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
          workspaceId: data.node.workspaceId,
          widgetAlignSystem: data.node.widgetAlignSystem,
          widgets: data.node.widgets
        } as Scene)
      : undefined;
  }, [data]);

  return { scene, ...rest };
};

export const useValidateSceneAlias = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [fetchCheckSceneAlias] = useLazyQuery(CHECK_SCENE_ALIAS, {
    fetchPolicy: "network-only" // Disable caching for this query
  });

  const validateSceneAlias = useCallback(
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
    validateSceneAlias
  };
};
