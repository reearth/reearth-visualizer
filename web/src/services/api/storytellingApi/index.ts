import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryInput,
  CreateStoryMutation,
  MutationCreateStoryArgs,
  UpdateStoryInput,
} from "@reearth/services/gql/__gen__/graphql";
import { CREATE_STORY, UPDATE_STORY } from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../../state";

import useBlocks from "./blocks";
import usePages from "./pages";

export default function useStorytellingAPI() {
  const t = useT();
  const [, setNotification] = useNotification();

  const { useCreateStoryPage, useDeleteStoryPage, useMoveStoryPage } = usePages();
  const {
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock,
  } = useBlocks();

  const [createStoryMutation] = useMutation<CreateStoryMutation, MutationCreateStoryArgs>(
    CREATE_STORY,
  );
  const useCreateStory = useCallback(
    async (input: CreateStoryInput): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, errors } = await createStoryMutation({ variables: { input } });
      if (errors || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfullly created a story!") });

      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  const [updateStoryMutation] = useMutation(UPDATE_STORY, { refetchQueries: ["GetScene"] });
  const useUpdateStory = useCallback(
    async (input: UpdateStoryInput) => {
      if (!input.storyId) return { status: "error" };
      const { data, errors } = await updateStoryMutation({ variables: { input } });
      if (errors || !data?.updateStory) {
        setNotification({ type: "error", text: t("Failed to update story.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfullly updated a story!") });

      return { data, status: "success" };
    },
    [updateStoryMutation, t, setNotification],
  );

  return {
    useCreateStory,
    useUpdateStory,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock,
  };
}
