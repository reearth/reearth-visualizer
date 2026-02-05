import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  AddStyleMutation,
  MutationAddStyleArgs,
  AddStyleInput,
  UpdateStyleInput,
  UpdateStyleMutation,
  RemoveStyleMutation,
  RemoveStyleInput
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_LAYERSTYLE,
  REMOVE_LAYERSTYLE,
  UPDATE_LAYERSTYLE
} from "@reearth/services/gql/queries/layerStyle";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const useLayerStyleMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [addLayerStyleMutation] = useMutation<
    AddStyleMutation,
    MutationAddStyleArgs
  >(ADD_LAYERSTYLE, {
    refetchQueries: ["GetScene"]
  });
  const addLayerStyle = useCallback(
    async (input: AddStyleInput): Promise<MutationReturn<AddStyleMutation>> => {
      const { data, errors } = await addLayerStyleMutation({
        variables: { input }
      });
      if (errors || !data?.addStyle?.style?.id) {
        setNotification({
          type: "error",
          text: t("Failed to add layer style.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully added a new layer style!")
      });

      return { data, status: "success" };
    },
    [addLayerStyleMutation, setNotification, t]
  );

  const [updateLayerStyleMutation] = useMutation(UPDATE_LAYERSTYLE, {
    refetchQueries: ["GetScene"]
  });
  const updateLayerStyle = useCallback(
    async (
      input: UpdateStyleInput
    ): Promise<MutationReturn<UpdateStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await updateLayerStyleMutation({
        variables: { input }
      });
      if (errors || !data?.updateStyle) {
        setNotification({
          type: "error",
          text: t("Failed to update the layerStyle.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated a the layerStyle!")
      });

      return { data, status: "success" };
    },
    [updateLayerStyleMutation, setNotification, t]
  );

  const [removeLayerStyleMutation] = useMutation(REMOVE_LAYERSTYLE, {
    refetchQueries: ["GetScene"]
  });
  const removeLayerStyle = useCallback(
    async (
      input: RemoveStyleInput
    ): Promise<MutationReturn<RemoveStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await removeLayerStyleMutation({
        variables: { input }
      });
      if (errors || !data?.removeStyle) {
        setNotification({
          type: "error",
          text: t("Failed to delete the layer style.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully deleted the layer style!")
      });

      return { data, status: "success" };
    },
    [removeLayerStyleMutation, setNotification, t]
  );

  return {
    addLayerStyle,
    updateLayerStyle,
    removeLayerStyle
  };
};
