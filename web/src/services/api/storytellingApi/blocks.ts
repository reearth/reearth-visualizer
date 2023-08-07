import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import { ExtensionType } from "@reearth/services/config/extensions";
import {
  CreateStoryBlockInput,
  CreateStoryBlockMutation,
  GetSceneQuery,
  MoveStoryBlockInput,
  MoveStoryBlockMutation,
  MutationCreateStoryBlockArgs,
  MutationMoveStoryBlockArgs,
  MutationRemoveStoryBlockArgs,
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

import { SceneQueryProps } from "../sceneApi";

export type StoryBlockQueryProps = SceneQueryProps;

export type InstallableStoryBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: ExtensionType;
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

  const [createStoryBlockMutation] = useMutation<
    CreateStoryBlockMutation,
    MutationCreateStoryBlockArgs
  >(CREATE_STORY_BLOCK);

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
  >(REMOVE_STORY_BLOCK);

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
        .filter(e => e.extensionId.toLowerCase().includes("storyblock")) // TODO: Change this filter to check for extensionType of storyblock
        .map((e): any => {
          return {
            pluginId: plugin.id,
            ...e,
          };
        })
        .filter((sb): sb is any => !!sb);
    })
    .reduce<InstallableStoryBlock[]>((a, b) => (b ? [...a, ...b] : a), []);
};
