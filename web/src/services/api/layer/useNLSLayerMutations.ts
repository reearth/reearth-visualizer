import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  AddNlsLayerSimpleMutation,
  MutationAddNlsLayerSimpleArgs,
  AddNlsLayerSimpleInput,
  UpdateNlsLayerInput,
  UpdateNlsLayerMutation,
  RemoveNlsLayerMutation,
  RemoveNlsLayerInput,
  UpdateNlsLayersInput,
  UpdateNlsLayersMutation
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_NLSLAYERSIMPLE,
  UPDATE_NLSLAYER,
  REMOVE_NLSLAYER,
  UPDATE_NLSLAYERS
} from "@reearth/services/gql/queries/layer";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const useNLSLayerMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [addNLSLayerSimpleMutation] = useMutation<
    AddNlsLayerSimpleMutation,
    MutationAddNlsLayerSimpleArgs
  >(ADD_NLSLAYERSIMPLE, {
    refetchQueries: ["GetScene"]
  });
  const addNLSLayerSimple = useCallback(
    async (
      input: AddNlsLayerSimpleInput
    ): Promise<MutationReturn<AddNlsLayerSimpleMutation>> => {
      const { data, errors } = await addNLSLayerSimpleMutation({
        variables: { input }
      });
      if (errors || !data?.addNLSLayerSimple?.layers?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully added a new layer")
      });

      return { data, status: "success" };
    },
    [addNLSLayerSimpleMutation, setNotification, t]
  );

  const [updateNLSLayerMutation] = useMutation(UPDATE_NLSLAYER, {
    refetchQueries: ["GetScene"]
  });
  const updateNLSLayer = useCallback(
    async (
      input: UpdateNlsLayerInput
    ): Promise<MutationReturn<UpdateNlsLayerMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await updateNLSLayerMutation({
        variables: { input }
      });
      if (errors || !data?.updateNLSLayer) {
        setNotification({
          type: "error",
          text: t("Failed to update the layer.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the layer!")
      });

      return { data, status: "success" };
    },
    [updateNLSLayerMutation, t, setNotification]
  );

  const [updateNLSLayersMutation] = useMutation(UPDATE_NLSLAYERS, {
    refetchQueries: ["GetScene"]
  });
  const updateNLSLayers = useCallback(
    async (
      input: UpdateNlsLayersInput
    ): Promise<MutationReturn<UpdateNlsLayersMutation>> => {
      if (!input) return { status: "error" };
      const { data, errors } = await updateNLSLayersMutation({
        variables: { input }
      });
      if (errors || !data?.updateNLSLayers) {
        setNotification({
          type: "error",
          text: t("Failed to update the layer.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the layer!")
      });

      return { data, status: "success" };
    },
    [updateNLSLayersMutation, setNotification, t]
  );

  const [removeNLSLayerMutation] = useMutation(REMOVE_NLSLAYER, {
    refetchQueries: ["GetScene"]
  });
  const removeNLSLayer = useCallback(
    async (
      input: RemoveNlsLayerInput
    ): Promise<MutationReturn<RemoveNlsLayerMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await removeNLSLayerMutation({
        variables: { input }
      });
      if (errors || !data?.removeNLSLayer) {
        setNotification({
          type: "error",
          text: t("Failed to remove the layer.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully removed the layer!")
      });

      return { data, status: "success" };
    },
    [removeNLSLayerMutation, t, setNotification]
  );

  return {
    addNLSLayerSimple,
    updateNLSLayer,
    updateNLSLayers,
    removeNLSLayer
  };
};
