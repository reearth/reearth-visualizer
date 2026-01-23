import { useQuery } from "@apollo/client";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import type { SceneQueryProps } from "../scene";

import { getInstallableStoryBlocks, getInstalledStoryBlocks } from "./utils";

export const useInstallableStoryBlocks = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();
  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installableStoryBlocks = useMemo(
    () => getInstallableStoryBlocks(data),
    [data]
  );

  return { installableStoryBlocks, ...rest };
};

export const useInstalledStoryBlocks = ({
  sceneId,
  storyId,
  pageId
}: SceneQueryProps & {
  storyId?: string;
  pageId?: string;
}) => {
  const lang = useLang();
  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installedStoryBlocks = useMemo(
    () => getInstalledStoryBlocks(data, storyId, pageId),
    [data, storyId, pageId]
  );

  return { installedStoryBlocks, ...rest };
};
