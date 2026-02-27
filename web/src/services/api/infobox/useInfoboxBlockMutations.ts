import { useMutation } from "@apollo/client/react";
import {
  AddNlsInfoboxBlockInput,
  AddNlsInfoboxBlockMutation,
  MoveNlsInfoboxBlockInput,
  MoveNlsInfoboxBlockMutation,
  MutationAddNlsInfoboxBlockArgs,
  MutationMoveNlsInfoboxBlockArgs,
  MutationRemoveNlsInfoboxBlockArgs,
  RemoveNlsInfoboxBlockInput,
  RemoveNlsInfoboxBlockMutation
} from "@reearth/services/gql";
import {
  ADD_NLSINFOBOX_BLOCK,
  MOVE_NLSINFOBOX_BLOCK,
  REMOVE_NLSINFOBOX_BLOCK
} from "@reearth/services/gql/queries/infobox";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

export const useInfoboxBlockMutations = () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [createInfoboxBlockMutation] = useMutation<
    AddNlsInfoboxBlockMutation,
    MutationAddNlsInfoboxBlockArgs
  >(ADD_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const createInfoboxBlock = useCallback(
    async (
      input: AddNlsInfoboxBlockInput
    ): Promise<MutationReturn<AddNlsInfoboxBlockMutation>> => {
      const { data, error } = await createInfoboxBlockMutation({
        variables: { input }
      });
      if (error || !data?.addNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to create block.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully created a block!")
      });

      return { data, status: "success" };
    },
    [createInfoboxBlockMutation, setNotification, t]
  );

  const [removeInfoboxBlockMutation] = useMutation<
    RemoveNlsInfoboxBlockMutation,
    MutationRemoveNlsInfoboxBlockArgs
  >(REMOVE_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const deleteInfoboxBlock = useCallback(
    async (
      input: RemoveNlsInfoboxBlockInput
    ): Promise<MutationReturn<RemoveNlsInfoboxBlockMutation>> => {
      const { data, error } = await removeInfoboxBlockMutation({
        variables: { input }
      });
      if (error || !data?.removeNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to delete block.") });

        return { status: "error", error };
      }
      setNotification({
        type: "info",
        text: t("Block was successfully deleted.")
      });

      return { data, status: "success" };
    },
    [removeInfoboxBlockMutation, setNotification, t]
  );

  const [moveInfoboxBlockMutation] = useMutation<
    MoveNlsInfoboxBlockMutation,
    MutationMoveNlsInfoboxBlockArgs
  >(MOVE_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const moveInfoboxBlock = useCallback(
    async (
      input: MoveNlsInfoboxBlockInput
    ): Promise<MutationReturn<MoveNlsInfoboxBlockMutation>> => {
      const { data, error } = await moveInfoboxBlockMutation({
        variables: { input }
      });
      if (error || !data?.moveNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to move block.") });

        return { status: "error", error };
      }
      setNotification({
        type: "info",
        text: t("Block was successfully moved.")
      });

      return { data, status: "success" };
    },
    [moveInfoboxBlockMutation, setNotification, t]
  );

  return {
    createInfoboxBlock,
    deleteInfoboxBlock,
    moveInfoboxBlock
  };
};
