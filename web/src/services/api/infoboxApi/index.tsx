import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import {
  CreateNlsInfoboxInput,
  CreateNlsInfoboxMutation,
  MutationCreateNlsInfoboxArgs,
} from "@reearth/services/gql";
import { CREATE_NLSINFOBOX } from "@reearth/services/gql/queries/infobox";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";
import { MutationReturn } from "../types";

import useBlocks from "./blocks";

export type InfoboxQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createNLSInfoboxMutation] = useMutation<
    CreateNlsInfoboxMutation,
    MutationCreateNlsInfoboxArgs
  >(CREATE_NLSINFOBOX, { refetchQueries: ["GetScene"] });
  const useCreateNLSInfobox = useCallback(
    async (input: CreateNlsInfoboxInput): Promise<MutationReturn<CreateNlsInfoboxMutation>> => {
      const { data, errors } = await createNLSInfoboxMutation({ variables: { input } });
      if (errors || !data?.createNLSInfobox?.layer?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully added a new layer") });

      return { data, status: "success" };
    },
    [createNLSInfoboxMutation, setNotification, t],
  );

  const {
    useInstallableInfoboxBlocksQuery,
    useCreateInfoboxBlock,
    useDeleteInfoboxBlock,
    useMoveInfoboxBlock,
  } = useBlocks();

  return {
    useCreateNLSInfobox,
    // blocks
    useInstallableInfoboxBlocksQuery,
    useCreateInfoboxBlock,
    useDeleteInfoboxBlock,
    useMoveInfoboxBlock,
  };
};
