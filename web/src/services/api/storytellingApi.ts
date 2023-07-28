import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryInput,
  CreateStoryMutation,
  CreateStoryPageInput,
  CreateStoryPageMutation,
  CreateTeamPayload,
  DeleteStoryPageInput,
  DeleteStoryPageMutation,
  MoveStoryPageInput,
  MoveStoryPageMutation,
  MutationCreateStoryArgs,
  MutationCreateStoryPageArgs,
  MutationMoveStoryPageArgs,
  MutationRemoveStoryPageArgs,
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY,
  CREATE_STORY_PAGE,
  DELETE_STORY_PAGE,
  MOVE_STORY_PAGE,
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

export type Team = CreateTeamPayload["team"];

export default function useStorytellingAPI() {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createStoryMutation] = useMutation<CreateStoryMutation, MutationCreateStoryArgs>(
    CREATE_STORY,
  );
  const useCreateStory = useCallback(
    async (input: CreateStoryInput): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, errors } = await createStoryMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", errors };
      }
      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  const [createStoryPageMutation] = useMutation<
    CreateStoryPageMutation,
    MutationCreateStoryPageArgs
  >(CREATE_STORY_PAGE);

  const useCreateStoryPage = useCallback(
    async (input: CreateStoryPageInput): Promise<MutationReturn<CreateStoryPageMutation>> => {
      const { data, errors } = await createStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create page.") });

        return { status: "error", errors };
      }
      return { data, status: "success" };
    },
    [createStoryPageMutation, setNotification, t],
  );

  const [deleteStoryPageMutation] = useMutation<
    DeleteStoryPageMutation,
    MutationRemoveStoryPageArgs
  >(DELETE_STORY_PAGE);

  const useDeleteStoryPage = useCallback(
    async (input: DeleteStoryPageInput): Promise<MutationReturn<DeleteStoryPageMutation>> => {
      const { data, errors } = await deleteStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.removeStoryPage?.story?.id) {
        return { status: "error", errors };
      }

      return { data, status: "success" };
    },
    [deleteStoryPageMutation],
  );

  const [moveStoryPageMutation] = useMutation<MoveStoryPageMutation, MutationMoveStoryPageArgs>(
    MOVE_STORY_PAGE,
  );

  const useMoveStoryPage = useCallback(
    async (input: MoveStoryPageInput): Promise<MutationReturn<MoveStoryPageMutation>> => {
      const { data, errors } = await moveStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.moveStoryPage?.story?.id) {
        return { status: "error", errors };
      }

      return { data, status: "success" };
    },
    [moveStoryPageMutation],
  );

  return {
    useCreateStory,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
  };
}
