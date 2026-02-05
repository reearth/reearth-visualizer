import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  AddGeoJsonFeatureInput,
  AddGeoJsonFeatureMutation,
  DeleteGeoJsonFeatureInput,
  MutationAddGeoJsonFeatureArgs,
  UpdateGeoJsonFeatureInput,
  UpdateGeoJsonFeatureMutation
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_GEOJSON_FEATURE,
  DELETE_GEOJSON_FEATURE,
  UPDATE_GEOJSON_FEATURE
} from "@reearth/services/gql/queries/featureCollection";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const useFeatureCollectionMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [addGeoJsonFeatureMutation] = useMutation<
    AddGeoJsonFeatureMutation,
    MutationAddGeoJsonFeatureArgs
  >(ADD_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"]
  });

  const addGeoJsonFeature = useCallback(
    async (
      input: AddGeoJsonFeatureInput
    ): Promise<MutationReturn<AddGeoJsonFeatureMutation>> => {
      const { data, error } = await addGeoJsonFeatureMutation({
        variables: { input }
      });
      if (error || !data?.addGeoJSONFeature.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully added a new layer")
      });
      return { data, status: "success" };
    },
    [addGeoJsonFeatureMutation, setNotification, t]
  );

  const [updateGeoJsonFeatureMutation] = useMutation(UPDATE_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"]
  });

  const updateGeoJSONFeature = useCallback(
    async (
      input: UpdateGeoJsonFeatureInput
    ): Promise<MutationReturn<UpdateGeoJsonFeatureMutation>> => {
      if (!input.layerId) return { status: "error" };
      const { data, error } = await updateGeoJsonFeatureMutation({
        variables: { input }
      });
      if (error || !data?.updateGeoJSONFeature) {
        setNotification({
          type: "error",
          text: t("Failed to update the layer.")
        });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the layer!")
      });

      return { data, status: "success" };
    },
    [updateGeoJsonFeatureMutation, setNotification, t]
  );

  const [deleteGeoJsonFeatureMutation] = useMutation(DELETE_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"]
  });

  const deleteGeoJSONFeature = useCallback(
    async (input: DeleteGeoJsonFeatureInput) => {
      if (!input.layerId || !input.featureId) return { status: "error" };
      const { data, error } = await deleteGeoJsonFeatureMutation({
        variables: { input }
      });
      if (error || !data?.deleteGeoJSONFeature) {
        setNotification({
          type: "error",
          text: t("Failed to delete the feature.")
        });
        return { status: "error", error };
      }

      setNotification({
        type: "success",
        text: t("Successfully deleted the feature!")
      });
      return { data, status: "success" };
    },
    [deleteGeoJsonFeatureMutation, t, setNotification]
  );

  return {
    addGeoJsonFeature,
    updateGeoJSONFeature,
    deleteGeoJSONFeature
  };
};
