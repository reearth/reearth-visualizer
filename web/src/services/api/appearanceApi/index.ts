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
  ADD_APPEARANCE,
  REMOVE_APPEARANCE,
  UPDATE_APPEARANCE,
} from "@reearth/services/gql/queries/appearance";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";

import { getAppearances } from "./utils";

export type AppearancesQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useGetAppearancesQuery = useCallback(({ sceneId, lang }: AppearancesQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const appearances = useMemo(() => getAppearances(data), [data]);

    return { appearances, ...rest };
  }, []);

  const [addAppearanceMutation] = useMutation<AddStyleMutation, MutationAddStyleArgs>(
    ADD_APPEARANCE,
    {
      refetchQueries: ["GetScene"],
    },
  );
  const useAddAppearance = useCallback(
    async (input: AddStyleInput): Promise<MutationReturn<AddStyleMutation>> => {
      const { data, errors } = await addAppearanceMutation({ variables: { input } });
      if (errors || !data?.addStyle?.style?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully added a new appearance") });

      return { data, status: "success" };
    },
    [addAppearanceMutation, setNotification, t],
  );

  const [updateAppearanceMutation] = useMutation(UPDATE_APPEARANCE, {
    refetchQueries: ["GetScene"],
  });
  const useUpdateAppearance = useCallback(
    async (input: UpdateStyleInput): Promise<MutationReturn<UpdateStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await updateAppearanceMutation({ variables: { input } });
      if (errors || !data?.updateStyle) {
        setNotification({ type: "error", text: t("Failed to update the layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully updated a the layer!") });

      return { data, status: "success" };
    },
    [updateAppearanceMutation, setNotification, t],
  );

  const [removeAppearanceMutation] = useMutation(REMOVE_APPEARANCE, {
    refetchQueries: ["GetScene"],
  });
  const useRemoveAppearance = useCallback(
    async (input: RemoveStyleInput): Promise<MutationReturn<RemoveStyleMutation>> => {
      if (!input.styleId) return { status: "error" };
      const { data, errors } = await removeAppearanceMutation({ variables: { input } });
      if (errors || !data?.removeStyle) {
        setNotification({ type: "error", text: t("Failed to remove the layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully removed a the layer!") });

      return { data, status: "success" };
    },
    [removeAppearanceMutation, setNotification, t],
  );

  return {
    useGetAppearancesQuery,
    useAddAppearance,
    useUpdateAppearance,
    useRemoveAppearance,
  };
};
