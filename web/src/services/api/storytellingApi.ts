import { useMutation } from "@apollo/client";
import { useCallback } from "react";

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
  const createStory = useCallback(
    async (input: CreateStoryInput, opt?: { disableNotification?: boolean }) => {
      const { data, errors } = await createStoryMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStory?.story?.id) {
        console.log("GraphQL: Failed to create story", errors);
        if (!opt?.disableNotification) {
          setNotification({ type: "error", text: t("Failed to create story.") });
        }

        return { status: "error", errors };
      }

      if (!opt?.disableNotification) {
        setNotification({ type: "success", text: t("Successfully created story!") });
      }
      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  const [createStoryPageMutation] = useMutation<
    CreateStoryPageMutation,
    MutationCreateStoryPageArgs
  >(CREATE_STORY_PAGE);

  const createStoryPage = useCallback(
    async (input: CreateStoryPageInput) => {
      const { data, errors } = await createStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStoryPage?.story?.id) {
        console.log("GraphQL: Failed to create story page", errors);
        return { status: "error", errors };
      }
      return { data, status: "success" };
    },
    [createStoryPageMutation],
  );

  const [deleteStoryPageMutation] = useMutation<
    DeleteStoryPageMutation,
    MutationRemoveStoryPageArgs
  >(DELETE_STORY_PAGE);

  const deleteStoryPage = useCallback(
    async (input: DeleteStoryPageInput) => {
      const { data, errors } = await deleteStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.removeStoryPage?.story?.id) {
        console.log("GraphQL: Failed to delete story page", errors);
        return { status: "error", errors };
      }

      return { data, status: "success" };
    },
    [deleteStoryPageMutation],
  );

  const [moveStoryPageMutation] = useMutation<MoveStoryPageMutation, MutationMoveStoryPageArgs>(
    MOVE_STORY_PAGE,
  );

  const moveStoryPage = useCallback(
    async (input: MoveStoryPageInput) => {
      const { data, errors } = await moveStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.moveStoryPage?.page?.id) {
        console.log("GraphQL: Failed to move story page", errors);
        return { status: "error", errors };
      }

      return { data, status: "success" };
    },
    [moveStoryPageMutation],
  );

  return {
    createStory,
    createStoryPage,
    deleteStoryPage,
    moveStoryPage,
  };
}
