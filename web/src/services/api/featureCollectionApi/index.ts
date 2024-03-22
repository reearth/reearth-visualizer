import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  AddGeoJsonFeatureInput,
  AddGeoJsonFeatureMutation,
  MutationAddGeoJsonFeatureArgs,
} from "@reearth/services/gql/__gen__/graphql";
import { ADD_GEOJSON_FEATURE } from "@reearth/services/gql/queries/featureCollection";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";

export type LayerQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [addGeoJsonFeatureMutation] = useMutation<
    AddGeoJsonFeatureMutation,
    MutationAddGeoJsonFeatureArgs
  >(ADD_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"],
  });
  const useAddGeoJsonFeature = useCallback(
    async (input: AddGeoJsonFeatureInput): Promise<MutationReturn<AddGeoJsonFeatureMutation>> => {
      const { data, errors } = await addGeoJsonFeatureMutation({ variables: { input } });
      if (errors || !data?.addGeoJSONFeature.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully added a new layer") });

      return { data, status: "success" };
    },
    [addGeoJsonFeatureMutation, setNotification, t],
  );

  return {
    useAddGeoJsonFeature,
  };
};
