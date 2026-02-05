import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryBlockInput,
  CreateStoryBlockMutation,
  MoveStoryBlockInput,
  MoveStoryBlockMutation,
  MutationCreateStoryBlockArgs,
  MutationMoveStoryBlockArgs,
  MutationRemoveStoryBlockArgs,
  RemoveStoryBlockInput,
  RemoveStoryBlockMutation
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY_BLOCK,
  MOVE_STORY_BLOCK,
  REMOVE_STORY_BLOCK
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const useStoryBlockMutations = () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [createStoryBlockMutation] = useMutation<
    CreateStoryBlockMutation,
    MutationCreateStoryBlockArgs
  >(CREATE_STORY_BLOCK, { refetchQueries: ["GetScene"] });

  const createStoryBlock = useCallback(
    async (
      input: CreateStoryBlockInput
    ): Promise<MutationReturn<CreateStoryBlockMutation>> => {
      const { data, errors } = await createStoryBlockMutation({
        variables: { input }
      });
      if (errors || !data?.createStoryBlock) {
        setNotification({ type: "error", text: t("Failed to create block.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully created a block!")
      });

      return { data, status: "success" };
    },
    [createStoryBlockMutation, setNotification, t]
  );

  const [removeStoryBlockMutation] = useMutation<
    RemoveStoryBlockMutation,
    MutationRemoveStoryBlockArgs
  >(REMOVE_STORY_BLOCK, { refetchQueries: ["GetScene"] });

  const deleteStoryBlock = useCallback(
    async (
      input: RemoveStoryBlockInput
    ): Promise<MutationReturn<RemoveStoryBlockMutation>> => {
      const { data, errors } = await removeStoryBlockMutation({
        variables: { input }
      });
      if (errors || !data?.removeStoryBlock) {
        setNotification({ type: "error", text: t("Failed to delete block.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "info",
        text: t("Block was successfully deleted.")
      });

      return { data, status: "success" };
    },
    [removeStoryBlockMutation, setNotification, t]
  );

  const [moveStoryBlockMutation] = useMutation<
    MoveStoryBlockMutation,
    MutationMoveStoryBlockArgs
  >(MOVE_STORY_BLOCK, { refetchQueries: ["GetScene"] });

  const moveStoryBlock = useCallback(
    async (
      input: MoveStoryBlockInput
    ): Promise<MutationReturn<MoveStoryBlockMutation>> => {
      const { data, errors } = await moveStoryBlockMutation({
        variables: { input }
      });
      if (errors || !data?.moveStoryBlock) {
        setNotification({ type: "error", text: t("Failed to move block.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "info",
        text: t("Block was successfully moved.")
      });

      return { data, status: "success" };
    },
    [moveStoryBlockMutation, setNotification, t]
  );
  return {
    createStoryBlock,
    deleteStoryBlock,
    moveStoryBlock
  };
};
