import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryPageInput,
  CreateStoryPageMutation,
  CreateTeamPayload,
  DeleteStoryPageInput,
  DeleteStoryPageMutation,
  MoveStoryPageInput,
  MoveStoryPageMutation,
  MutationCreateStoryPageArgs,
  MutationMoveStoryPageArgs,
  MutationRemoveStoryPageArgs,
  MutationUpdateStoryPageArgs,
  UpdateStoryPageInput,
  UpdateStoryPageMutation,
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY_PAGE,
  DELETE_STORY_PAGE,
  MOVE_STORY_PAGE,
  UPDATE_STORY_PAGE,
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../../state";

export type Team = CreateTeamPayload["team"];

export default () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [createStoryPageMutation] = useMutation<
    CreateStoryPageMutation,
    MutationCreateStoryPageArgs
  >(CREATE_STORY_PAGE, { refetchQueries: ["GetScene"] });

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
      setNotification({ type: "success", text: t("Successfullly created a page!") });

      return { data, status: "success" };
    },
    [createStoryPageMutation, setNotification, t],
  );

  const [deleteStoryPageMutation] = useMutation<
    DeleteStoryPageMutation,
    MutationRemoveStoryPageArgs
  >(DELETE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const useDeleteStoryPage = useCallback(
    async (input: DeleteStoryPageInput): Promise<MutationReturn<DeleteStoryPageMutation>> => {
      const { data, errors } = await deleteStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.removeStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to delete page.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Page was successfully deleted.") });

      return { data, status: "success" };
    },
    [deleteStoryPageMutation, setNotification, t],
  );

  const [moveStoryPageMutation] = useMutation<MoveStoryPageMutation, MutationMoveStoryPageArgs>(
    MOVE_STORY_PAGE,
    { refetchQueries: ["GetScene"] },
  );

  const useMoveStoryPage = useCallback(
    async (input: MoveStoryPageInput): Promise<MutationReturn<MoveStoryPageMutation>> => {
      const { data, errors } = await moveStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.moveStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to move page.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Page was successfully moved.") });

      return { data, status: "success" };
    },
    [moveStoryPageMutation, setNotification, t],
  );

  const [updateStoryPageMutation] = useMutation<
    UpdateStoryPageMutation,
    MutationUpdateStoryPageArgs
  >(UPDATE_STORY_PAGE, { refetchQueries: ["GetScene"] });

  const useUpdateStoryPage = useCallback(
    async (input: UpdateStoryPageInput): Promise<MutationReturn<UpdateStoryPageMutation>> => {
      const { data, errors } = await updateStoryPageMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.updateStoryPage?.story?.id) {
        setNotification({ type: "error", text: t("Failed to update page.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfullly updated a page!") });

      return { data, status: "success" };
    },
    [updateStoryPageMutation, setNotification, t],
  );
  return {
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useUpdateStoryPage,
  };
};
