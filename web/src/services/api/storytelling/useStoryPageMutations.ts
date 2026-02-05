import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryPageInput,
  CreateStoryPageMutation,
  DeleteStoryPageInput,
  DeleteStoryPageMutation,
  MoveStoryPageInput,
  MoveStoryPageMutation,
  MutationCreateStoryPageArgs,
  MutationMoveStoryPageArgs,
  MutationRemoveStoryPageArgs,
  MutationUpdateStoryPageArgs,
  UpdateStoryPageInput,
  UpdateStoryPageMutation
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY_PAGE,
  DELETE_STORY_PAGE,
  MOVE_STORY_PAGE,
  UPDATE_STORY_PAGE
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback } from "react";

import { useNotification } from "../../state";

export const useStoryPageMutations = () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [createStoryPageMutation] = useMutation<
    CreateStoryPageMutation,
    MutationCreateStoryPageArgs
  >(CREATE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const createStoryPage = useCallback(
    async (
      input: CreateStoryPageInput
    ): Promise<MutationReturn<CreateStoryPageMutation>> => {
      const { data, error } = await createStoryPageMutation({
        variables: {
          input
        }
      });
      if (error || !data?.createStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create page.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully created a page!")
      });

      return { data, status: "success" };
    },
    [createStoryPageMutation, setNotification, t]
  );

  const [deleteStoryPageMutation] = useMutation<
    DeleteStoryPageMutation,
    MutationRemoveStoryPageArgs
  >(DELETE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const deleteStoryPage = useCallback(
    async (
      input: DeleteStoryPageInput
    ): Promise<MutationReturn<DeleteStoryPageMutation>> => {
      const { data, error } = await deleteStoryPageMutation({
        variables: {
          input
        }
      });
      if (error || !data?.removeStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to delete page.") });

        return { status: "error", error };
      }
      setNotification({
        type: "info",
        text: t("Page was successfully deleted.")
      });

      return { data, status: "success" };
    },
    [deleteStoryPageMutation, setNotification, t]
  );

  const [moveStoryPageMutation] = useMutation<
    MoveStoryPageMutation,
    MutationMoveStoryPageArgs
  >(MOVE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const moveStoryPage = useCallback(
    async (
      input: MoveStoryPageInput
    ): Promise<MutationReturn<MoveStoryPageMutation>> => {
      const { data, error } = await moveStoryPageMutation({
        variables: {
          input
        }
      });
      if (error || !data?.moveStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to move page.") });

        return { status: "error", error };
      }
      setNotification({
        type: "info",
        text: t("Page was successfully moved.")
      });

      return { data, status: "success" };
    },
    [moveStoryPageMutation, setNotification, t]
  );

  const [updateStoryPageMutation] = useMutation<
    UpdateStoryPageMutation,
    MutationUpdateStoryPageArgs
  >(UPDATE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const updateStoryPage = useCallback(
    async (
      input: UpdateStoryPageInput
    ): Promise<MutationReturn<UpdateStoryPageMutation>> => {
      const { data, error } = await updateStoryPageMutation({
        variables: {
          input
        }
      });
      if (error || !data?.updateStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to update page.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated a page!")
      });

      return { data, status: "success" };
    },
    [updateStoryPageMutation, setNotification, t]
  );
  return {
    createStoryPage,
    deleteStoryPage,
    moveStoryPage,
    updateStoryPage
  };
};
