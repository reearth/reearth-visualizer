import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  AddNlsLayerSimpleMutation,
  MutationAddNlsLayerSimpleArgs,
  AddNlsLayerSimpleInput,
  UpdateNlsLayerInput,
  UpdateNlsLayerMutation,
  RemoveNlsLayerMutation,
  RemoveNlsLayerInput,
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_NLSLAYERSIMPLE,
  UPDATE_NLSLAYER,
  REMOVE_NLSLAYER,
} from "@reearth/services/gql/queries/layer";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";

import { getLayers } from "./utils";

export type LayerQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useGetLayersQuery = useCallback(({ sceneId, lang }: LayerQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const nlsLayers = useMemo(() => getLayers(data), [data]);

    return { nlsLayers, ...rest };
  }, []);

  const [addNLSLayerSimpleMutation] = useMutation<
    AddNlsLayerSimpleMutation,
    MutationAddNlsLayerSimpleArgs
  >(ADD_NLSLAYERSIMPLE, {
    refetchQueries: ["GetScene"],
  });
  const useAddNLSLayerSimple = useCallback(
    async (input: AddNlsLayerSimpleInput): Promise<MutationReturn<AddNlsLayerSimpleMutation>> => {
      const { data, errors } = await addNLSLayerSimpleMutation({ variables: { input } });
      if (errors || !data?.addNLSLayerSimple?.layers?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully added a new layer") });

      return { data, status: "success" };
    },
    [addNLSLayerSimpleMutation, setNotification, t],
  );

  const [updateNLSLayerMutation] = useMutation(UPDATE_NLSLAYER, { refetchQueries: ["GetScene"] });
  const useUpdateNLSLayer = useCallback(
    async (input: UpdateNlsLayerInput): Promise<MutationReturn<UpdateNlsLayerMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await updateNLSLayerMutation({ variables: { input } });
      if (errors || !data?.updateNLSLayer) {
        setNotification({ type: "error", text: t("Failed to update the layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully updated the layer!") });

      return { data, status: "success" };
    },
    [updateNLSLayerMutation, t, setNotification],
  );

  const [removeNLSLayerMutation] = useMutation(REMOVE_NLSLAYER, { refetchQueries: ["GetScene"] });
  const useRemoveNLSLayer = useCallback(
    async (input: RemoveNlsLayerInput): Promise<MutationReturn<RemoveNlsLayerMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await removeNLSLayerMutation({ variables: { input } });
      if (errors || !data?.removeNLSLayer) {
        setNotification({ type: "error", text: t("Failed to remove the layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully removed a the layer!") });

      return { data, status: "success" };
    },
    [removeNLSLayerMutation, t, setNotification],
  );

  return {
    useGetLayersQuery,
    useAddNLSLayerSimple,
    useUpdateNLSLayer,
    useRemoveNLSLayer,
  };
};
