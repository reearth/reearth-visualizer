/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { v4 } from "uuid";

import { SceneQueryProps } from "../sceneApi";
import { addTaskAtom, removeTaskAtom } from "../state";

export type LayerQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const addTask = useSetAtom(addTaskAtom);
  const removeTask = useSetAtom(removeTaskAtom);

  const [addGeoJsonFeatureMutation] = useMutation<
    AddGeoJsonFeatureMutation,
    MutationAddGeoJsonFeatureArgs
  >(ADD_GEOJSON_FEATURE, {
    // refetchQueries: ["GetScene"]
  });
  const useAddGeoJsonFeature = useCallback(
    async (
      input: AddGeoJsonFeatureInput,
      sceneId: string
    ): Promise<MutationReturn<AddGeoJsonFeatureMutation>> => {
      const taskId = v4();
      addTask(taskId);
      const { data, errors } = await addGeoJsonFeatureMutation({
        variables: { input },
        optimisticResponse: {
          __typename: "Mutation",
          addGeoJSONFeature: {
            __typename: "Feature",
            id: v4(),
            type: "Feature",
            properties: input.properties
          }
        },
        update: (cache, { data }) => {
          const scene = cache.readQuery({
            query: GET_SCENE,
            variables: { sceneId }
          });

          if (scene?.node?.__typename !== "Scene" || !data?.addGeoJSONFeature)
            return;

          cache.writeQuery({
            query: GET_SCENE,
            variables: {
              sceneId
            },
            data: {
              ...scene,
              node: {
                ...scene?.node,
                newLayers: scene?.node?.newLayers?.map((layer: any) => {
                  if (layer.id === input.layerId) {
                    return {
                      ...layer,
                      sketch: {
                        ...layer.sketch,
                        featureCollection: {
                          ...layer.sketch.featureCollection,
                          features: [
                            ...layer.sketch.featureCollection.features,
                            {
                              ...data.addGeoJSONFeature,
                              geometry: {
                                ...input.geometry,
                                __typename: input.geometry.type,
                                ...(input.geometry.type === "Point"
                                  ? {
                                      pointCoordinates:
                                        input.geometry.coordinates
                                    }
                                  : {}),
                                ...(input.geometry.type === "LineString"
                                  ? {
                                      lineStringCoordinates:
                                        input.geometry.coordinates
                                    }
                                  : {}),
                                ...(input.geometry.type === "Polygon"
                                  ? {
                                      polygonCoordinates:
                                        input.geometry.coordinates
                                    }
                                  : {}),
                                ...(input.geometry.type === "MultiPolygon"
                                  ? {
                                      multiPolygonCoordinates:
                                        input.geometry.coordinates
                                    }
                                  : {})
                              }
                            }
                          ]
                        }
                      }
                    };
                  }
                  return layer;
                }),
                __typename: "Scene"
              }
            }
          });
        }
      });
      removeTask(taskId);

      if (errors || !data?.addGeoJSONFeature.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });
        return { status: "error", errors };
      }

      // setNotification({
      //   type: "success",
      //   text: t("Successfully added a new layer")
      // });
      return { data, status: "success" };
    },
    [addGeoJsonFeatureMutation, setNotification, addTask, removeTask, t]
  );

  const [updateGeoJsonFeatureMutation] = useMutation(UPDATE_GEOJSON_FEATURE, {
    // refetchQueries: ["GetScene"]
  });

  const useUpdateGeoJSONFeature = useCallback(
    async (
      input: UpdateGeoJsonFeatureInput,
      sceneId: string
    ): Promise<MutationReturn<UpdateGeoJsonFeatureMutation>> => {
      if (!input.layerId) return { status: "error" };
      const taskId = v4();
      addTask(taskId);
      const { data, errors } = await updateGeoJsonFeatureMutation({
        variables: { input },
        optimisticResponse: {
          __typename: "Mutation",
          updateGeoJSONFeature: {
            __typename: "Feature",
            id: input.featureId,
            type: "Feature",
            properties: input.properties
          }
        },
        update: (cache, { data }) => {
          const scene = cache.readQuery({
            query: GET_SCENE,
            variables: { sceneId }
          });

          if (
            scene?.node?.__typename !== "Scene" ||
            !data?.updateGeoJSONFeature
          )
            return;

          cache.writeQuery({
            query: GET_SCENE,
            variables: {
              sceneId
            },
            data: {
              ...scene,
              node: {
                ...scene?.node,
                newLayers: scene?.node?.newLayers?.map((layer: any) => {
                  if (
                    layer.sketch.featureCollection.features.some(
                      (f: any) => f.id === data.updateGeoJSONFeature.id
                    )
                  ) {
                    return {
                      ...layer,
                      sketch: {
                        ...layer.sketch,
                        featureCollection: {
                          ...layer.sketch.featureCollection,
                          features: layer.sketch.featureCollection.features.map(
                            (f: any) => {
                              if (f.id === data.updateGeoJSONFeature.id) {
                                return {
                                  ...f,
                                  properties:
                                    data.updateGeoJSONFeature.properties,
                                  geometry: {
                                    ...input.geometry,
                                    __typename: input.geometry.type,
                                    ...(input.geometry.type === "Point"
                                      ? {
                                          pointCoordinates:
                                            input.geometry.coordinates
                                        }
                                      : {}),
                                    ...(input.geometry.type === "LineString"
                                      ? {
                                          lineStringCoordinates:
                                            input.geometry.coordinates
                                        }
                                      : {}),
                                    ...(input.geometry.type === "Polygon"
                                      ? {
                                          polygonCoordinates:
                                            input.geometry.coordinates
                                        }
                                      : {}),
                                    ...(input.geometry.type === "MultiPolygon"
                                      ? {
                                          multiPolygonCoordinates:
                                            input.geometry.coordinates
                                        }
                                      : {})
                                  }
                                };
                              }
                              return f;
                            }
                          )
                        }
                      }
                    };
                  }
                  return layer;
                }),
                __typename: "Scene"
              }
            }
          });
        }
      });
      removeTask(taskId);

      if (errors || !data?.updateGeoJSONFeature) {
        setNotification({
          type: "error",
          text: t("Failed to update the layer.")
        });
        return { status: "error", errors };
      }

      // setNotification({
      //   type: "success",
      //   text: t("Successfully updated the layer!")
      // });

      return { data, status: "success" };
    },
    [updateGeoJsonFeatureMutation, setNotification, addTask, removeTask, t]
  );

  const [deleteGeoJsonFeatureMutation] = useMutation(DELETE_GEOJSON_FEATURE, {
    refetchQueries: ["GetScene"]
  });

  const useDeleteGeoJSONFeature = useCallback(
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
    useAddGeoJsonFeature,
    useUpdateGeoJSONFeature,
    useDeleteGeoJSONFeature
  };
};
