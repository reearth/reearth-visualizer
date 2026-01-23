import { useMutation } from "@apollo/client";
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
      const { data, errors } = await addGeoJsonFeatureMutation({
        variables: { input }
      });
      if (errors || !data?.addGeoJSONFeature.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
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
      const { data, errors } = await updateGeoJsonFeatureMutation({
        variables: { input }
      });
      if (errors || !data?.updateGeoJSONFeature) {
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
    [updateGeoJsonFeatureMutation, setNotification, t]
  );

  const [deleteGeoJsonFeatureMutation] = useMutation(DELETE_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"]
  });

  const deleteGeoJSONFeature = useCallback(
    async (input: DeleteGeoJsonFeatureInput) => {
      if (!input.layerId || !input.featureId) return { status: "error" };
      const { data, errors } = await deleteGeoJsonFeatureMutation({
        variables: { input }
      });
      if (errors || !data?.deleteGeoJSONFeature) {
        setNotification({
          type: "error",
          text: t("Failed to delete the feature.")
        });
        return { status: "error", errors };
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
