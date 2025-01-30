import { useMutation, useQuery } from "@apollo/client";
import { MutationReturn } from "@reearth/services/api/types";
import {
  AddNlsLayerSimpleMutation,
  MutationAddNlsLayerSimpleArgs,
  AddNlsLayerSimpleInput,
  UpdateNlsLayerInput,
  UpdateNlsLayerMutation,
  RemoveNlsLayerMutation,
  RemoveNlsLayerInput,
  UpdateCustomPropertySchemaInput,
  UpdateCustomPropertiesMutation,
  UpdateNlsLayersInput,
  UpdateNlsLayersMutation,
  ChangeCustomPropertyTitleInput,
  ChangeCustomPropertyTitleMutation,
  RemoveCustomPropertyInput,
  RemoveCustomPropertyMutation
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_NLSLAYERSIMPLE,
  UPDATE_NLSLAYER,
  REMOVE_NLSLAYER,
  UPDATE_CUSTOM_PROPERTY_SCHEMA,
  UPDATE_NLSLAYERS,
  CHANGE_CUSTOM_PROPERTY_TITLE,
  REMOVE_CUSTOM_PROPERTY
} from "@reearth/services/gql/queries/layer";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang, useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useMemo } from "react";

import { SceneQueryProps } from "../sceneApi";

import { getLayers } from "./utils";

export type LayerQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const lang = useLang();
  const [, setNotification] = useNotification();

  const useGetLayersQuery = useCallback(
    ({ sceneId }: LayerQueryProps) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId
      });

      const nlsLayers = useMemo(() => getLayers(data), [data]);

      return { nlsLayers, ...rest };
    },
    [lang]
  );

  const [addNLSLayerSimpleMutation] = useMutation<
    AddNlsLayerSimpleMutation,
    MutationAddNlsLayerSimpleArgs
  >(ADD_NLSLAYERSIMPLE, {
    refetchQueries: ["GetScene"]
  });
  const useAddNLSLayerSimple = useCallback(
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
  const useUpdateNLSLayer = useCallback(
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
  const useUpdateNLSLayers = useCallback(
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
  const useRemoveNLSLayer = useCallback(
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

  const [updateCustomPropertiesMutation] = useMutation(
    UPDATE_CUSTOM_PROPERTY_SCHEMA,
    {
      refetchQueries: ["GetScene"]
    }
  );
  const useUpdateCustomProperties = useCallback(
    async (
      input: UpdateCustomPropertySchemaInput
    ): Promise<MutationReturn<UpdateCustomPropertiesMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await updateCustomPropertiesMutation({
        variables: { input }
      });
      if (errors || !data?.updateCustomProperties) {
        setNotification({
          type: "error",
          text: t("Failed to update the custom property schema.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the custom property schema!")
      });

      return { data, status: "success" };
    },
    [updateCustomPropertiesMutation, setNotification, t]
  );


  const [changeCustomPropertyTitleMutation] = useMutation(
      CHANGE_CUSTOM_PROPERTY_TITLE,
    {
      refetchQueries: ["GetScene"]
    }
  );
  
  const useChangeCustomPropertyTitle = useCallback(
    async (
      input: ChangeCustomPropertyTitleInput
    ): Promise<MutationReturn<ChangeCustomPropertyTitleMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await changeCustomPropertyTitleMutation({
        variables: { input }
      });
      if (errors || !data?.changeCustomPropertyTitle) {
        setNotification({
          type: "error",
          text: t("Failed to update the custom property title.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the custom property title!")
      });

      return { data, status: "success" };
    },
    [changeCustomPropertyTitleMutation, setNotification, t]
  );

  const [removeCustomPropertyMutation] = useMutation(REMOVE_CUSTOM_PROPERTY, {
    refetchQueries: ["GetScene"]
  });
  const useRemoveCustomProperty = useCallback(
    async (
      input: RemoveCustomPropertyInput
    ): Promise<MutationReturn<RemoveCustomPropertyMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, errors } = await removeCustomPropertyMutation({
        variables: { input }
      });
      if (errors || !data?.removeCustomProperty) {
        setNotification({
          type: "error",
          text: t("Failed to remove the custom property.")
        });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully removed the custom property!")
      });

      return { data, status: "success" };
    },
    [removeCustomPropertyMutation, setNotification, t]
  );

  return {
    useGetLayersQuery,
    useAddNLSLayerSimple,
    useUpdateNLSLayer,
    useUpdateNLSLayers,
    useRemoveNLSLayer,
    useUpdateCustomProperties,
    useChangeCustomPropertyTitle,
    useRemoveCustomProperty
  };
};
