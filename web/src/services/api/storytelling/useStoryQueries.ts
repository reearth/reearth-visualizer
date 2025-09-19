import { useLazyQuery, useQuery } from "@apollo/client";
import { CustomOptions } from "@reearth/services/api/types";
import { HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION } from "@reearth/services/gql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { CHECK_STORY_ALIAS } from "@reearth/services/gql/queries/storytelling";
import { useLang, useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useMemo } from "react";

import type { SceneQueryProps } from "../scene";

import { getStories } from "./utils";

export const useStories = (
  { sceneId }: SceneQueryProps,
  options?: CustomOptions
) => {
  const lang = useLang();
  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId || options?.skip
  });

  const stories = useMemo(() => getStories(data), [data]);

  return { stories, ...rest };
};

export const useValidateStoryAlias = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [fetchCheckProjectAlias] = useLazyQuery(CHECK_STORY_ALIAS, {
    fetchPolicy: "network-only" // Disable caching for this query
  });

  const validateStoryAlias = useCallback(
    async (alias: string, storyId?: string) => {
      if (!alias) return null;

      const { data, errors } = await fetchCheckProjectAlias({
        variables: { alias, storyId },
        errorPolicy: "all",
        context: {
          headers: {
            [HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION]: "true"
          }
        }
      });

      if (errors || !data?.checkStoryAlias) {
        return { status: "error", errors };
      }

      setNotification({
        type: "success",
        text: t("Successfully checked alias!")
      });
      return {
        available: data?.checkStoryAlias.available,
        alias: data?.checkStoryAlias.alias,
        status: "success"
      };
    },
    [fetchCheckProjectAlias, setNotification, t]
  );

  return {
    validateStoryAlias
  };
};
