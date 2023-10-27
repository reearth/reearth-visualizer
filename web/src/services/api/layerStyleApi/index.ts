import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  AddStyleMutation,
  MutationAddStyleArgs,
  AddStyleInput,
  UpdateStyleInput,
  UpdateStyleMutation,
  RemoveStyleMutation,
  RemoveStyleInput,
} from "@reearth/services/gql/__gen__/graphql";
import {
  ADD_LAYERSTYLE,
  REMOVE_LAYERSTYLE,
  UPDATE_LAYERSTYLE,
} from "@reearth/services/gql/queries/layerStyle";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";

import { getLayerStyles } from "./utils";

export type LayerStylesQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useGetLayerStylesQuery = useCallback(({ sceneId, lang }: LayerStylesQueryProps) => {
    const { data, loading, networkStatus, fetchMore, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const isRefetching = useMemo(() => networkStatus === 3, [networkStatus]);
    const layerStyles = useMemo(() => getLayerStyles(data), [data]);

    return { layerStyles, loading, isRefetching, fetchMore, ...rest };
  }, []);

  const [addLayerStyleMutation] = useMutation<AddStyleMutation, MutationAddStyleArgs>(
    ADD_LAYERSTYLE,
    {
      refetchQueries: ["GetScene"],
    },
  );
  const useAddLayerStyle = useCallback(
    async (input: AddStyleInput): Promise<MutationReturn<AddStyleMutation>> => {
      const { data, errors } = await addLayerStyleMutation({ variables: { input } });
      if (errors || !data?.addStyle?.style?.id) {
        setNotification({ type: "error", text: t("Failed to add layerStyle.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully added a new layerStyle!") });

      return { data, status: "success" };
    },
    [addLayerStyleMutation, setNotification, t],
  );

  const [updateLayerStyleMutation] = useMutation(UPDATE_LAYERSTYLE, {
    refetchQueries: ["GetScene"],
  });
  const useUpdateLayerStyle = useCallback(
    async (input: UpdateStyleInput): Promise<MutationReturn<UpdateStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await updateLayerStyleMutation({ variables: { input } });
      if (errors || !data?.updateStyle) {
        setNotification({ type: "error", text: t("Failed to update the layerStyle.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully updated a the layerStyle!") });

      return { data, status: "success" };
    },
    [updateLayerStyleMutation, setNotification, t],
  );

  const [removeLayerStyleMutation] = useMutation(REMOVE_LAYERSTYLE, {
    refetchQueries: ["GetScene"],
  });
  const useRemoveLayerStyle = useCallback(
    async (input: RemoveStyleInput): Promise<MutationReturn<RemoveStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await removeLayerStyleMutation({ variables: { input } });
      if (errors || !data?.removeStyle) {
        setNotification({ type: "error", text: t("Failed to remove the layerStyle.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully removed a the layerStyle!") });

      return { data, status: "success" };
    },
    [removeLayerStyleMutation, setNotification, t],
  );

  return {
    useGetLayerStylesQuery,
    useAddLayerStyle,
    useUpdateLayerStyle,
    useRemoveLayerStyle,
  };
};
