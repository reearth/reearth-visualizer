import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { AVAILABLE_STORY_BLOCK_IDS } from "@reearth/beta/lib/core/StoryPanel/constants";
import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryBlockInput,
  CreateStoryBlockMutation,
  GetSceneQuery,
  MoveStoryBlockInput,
  MoveStoryBlockMutation,
  MutationCreateStoryBlockArgs,
  MutationMoveStoryBlockArgs,
  MutationRemoveStoryBlockArgs,
  PluginExtensionType,
  RemoveStoryBlockInput,
  RemoveStoryBlockMutation,
} from "@reearth/services/gql/__gen__/graphql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import {
  CREATE_STORY_BLOCK,
  MOVE_STORY_BLOCK,
  REMOVE_STORY_BLOCK,
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { Item, convert } from "../propertyApi/utils";
import { SceneQueryProps } from "../sceneApi";

export type StoryBlockQueryProps = SceneQueryProps;

export type InstallableStoryBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "StoryBlock";
};

export type InstalledStoryBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  name: string;
  description: string | undefined;
  icon?: string;
  property?: {
    id: string;
    items: Item[] | undefined;
  };
};

export default () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const useInstallableStoryBlocksQuery = useCallback(({ sceneId, lang }: StoryBlockQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const installableStoryBlocks = useMemo(() => getInstallableStoryBlocks(data), [data]);

    return { installableStoryBlocks, ...rest };
  }, []);

  const useInstalledStoryBlocksQuery = useCallback(
    ({
      sceneId,
      lang,
      storyId,
      pageId,
    }: StoryBlockQueryProps & {
      storyId?: string;
      pageId?: string;
    }) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId,
      });

      const installedStoryBlocks = useMemo(
        () => getInstalledStoryBlocks(data, storyId, pageId),
        [data, storyId, pageId],
      );

      return { installedStoryBlocks, ...rest };
    },
    [],
  );

  const [createStoryBlockMutation] = useMutation<
    CreateStoryBlockMutation,
    MutationCreateStoryBlockArgs
  >(CREATE_STORY_BLOCK, { refetchQueries: ["GetScene"] });

  const useCreateStoryBlock = useCallback(
    async (input: CreateStoryBlockInput): Promise<MutationReturn<CreateStoryBlockMutation>> => {
      const { data, errors } = await createStoryBlockMutation({ variables: { input } });
      if (errors || !data?.createStoryBlock) {
        setNotification({ type: "error", text: t("Failed to create block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfullly created a block!") });

      return { data, status: "success" };
    },
    [createStoryBlockMutation, setNotification, t],
  );

  const [removeStoryBlockMutation] = useMutation<
    RemoveStoryBlockMutation,
    MutationRemoveStoryBlockArgs
  >(REMOVE_STORY_BLOCK, { refetchQueries: ["GetScene"] });

  const useDeleteStoryBlock = useCallback(
    async (input: RemoveStoryBlockInput): Promise<MutationReturn<RemoveStoryBlockMutation>> => {
      const { data, errors } = await removeStoryBlockMutation({ variables: { input } });
      if (errors || !data?.removeStoryBlock) {
        setNotification({ type: "error", text: t("Failed to delete block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Block was successfully deleted.") });

      return { data, status: "success" };
    },
    [removeStoryBlockMutation, setNotification, t],
  );

  const [moveStoryBlockMutation] = useMutation<MoveStoryBlockMutation, MutationMoveStoryBlockArgs>(
    MOVE_STORY_BLOCK,
    { refetchQueries: ["GetScene"] },
  );

  const useMoveStoryBlock = useCallback(
    async (input: MoveStoryBlockInput): Promise<MutationReturn<MoveStoryBlockMutation>> => {
      const { data, errors } = await moveStoryBlockMutation({ variables: { input } });
      if (errors || !data?.moveStoryBlock) {
        setNotification({ type: "error", text: t("Failed to move block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Block was successfully moved.") });

      return { data, status: "success" };
    },
    [moveStoryBlockMutation, setNotification, t],
  );
  return {
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock,
  };
};

const getInstallableStoryBlocks = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.plugins
    .map(p => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter(
          e =>
            e.type === PluginExtensionType.StoryBlock &&
            AVAILABLE_STORY_BLOCK_IDS.includes(`reearth/${e.extensionId}`),
        )
        .map((e): InstallableStoryBlock => {
          return {
            name: e.translatedName ?? e.name,
            description: e.translatedDescription ?? e.description,
            pluginId: plugin.id,
            extensionId: e.extensionId,
            icon: e.icon,
            singleOnly: !!e.singleOnly,
            type: "StoryBlock",
          };
        })
        .filter((sb): sb is InstallableStoryBlock => !!sb);
    })
    .reduce<InstallableStoryBlock[]>((a, b) => (b ? [...a, ...b] : a), []);
};

export const getInstalledStoryBlocks = (
  rawScene?: GetSceneQuery,
  storyId?: string,
  pageId?: string,
): InstalledStoryBlock[] | undefined => {
  if (!rawScene?.node || !storyId || !pageId) return;
  const scene = rawScene.node.__typename === "Scene" ? rawScene.node : undefined;

  const page = scene?.stories.find(s => s.id === storyId)?.pages.find(p => p.id === pageId);

  const installableStoryBlocks = getInstallableStoryBlocks(rawScene);

  return page?.blocks.map(b => {
    const block = installableStoryBlocks?.find(isb => isb.extensionId === b.extensionId);

    return {
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      name: block?.name ?? "Story Block",
      description: block?.description,
      icon: block?.icon,
      property: {
        id: b.property?.id ?? "",
        items: convert(b.property, null),
      },
    };
  });
};
