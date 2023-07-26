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
  MutationCreateStoryArgs,
  MutationCreateStoryPageArgs,
  MutationRemoveStoryPageArgs,
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY,
  CREATE_STORY_PAGE,
  DELETE_STORY_PAGE,
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
    async (input: CreateStoryPageInput, opt?: { disableNotification?: boolean }) => {
      const { data, errors } = await createStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStoryPage?.story?.id) {
        console.log("GraphQL: Failed to create story page", errors);
        if (!opt?.disableNotification) {
          setNotification({ type: "error", text: t("Failed to create page.") });
        }

        return { status: "error", errors };
      }

      if (!opt?.disableNotification) {
        setNotification({ type: "success", text: t("Successfully created page!") });
      }
      return { data, status: "success" };
    },
    [createStoryPageMutation, setNotification, t],
  );

  const [deleteStoryPageMutation] = useMutation<
    DeleteStoryPageMutation,
    MutationRemoveStoryPageArgs
  >(DELETE_STORY_PAGE);

  const deleteStoryPage = useCallback(
    async (input: DeleteStoryPageInput, opt?: { disableNotification?: boolean }) => {
      const { data, errors } = await deleteStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.removeStoryPage?.story?.id) {
        console.log("GraphQL: Failed to delete story page", errors);
        if (!opt?.disableNotification) {
          setNotification({ type: "error", text: t("Failed to delete page.") });
        }

        return { status: "error", errors };
      }

      if (!opt?.disableNotification) {
        setNotification({ type: "success", text: t("Successfully deleted page!") });
      }
      return { data, status: "success" };
    },
    [deleteStoryPageMutation, setNotification, t],
  );

  return {
    createStory,
    createStoryPage,
    deleteStoryPage,
  };
}
