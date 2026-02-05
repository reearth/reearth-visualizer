import { useMutation } from "@apollo/client/react";
import {
  CreateNlsPhotoOverlayInput,
  CreateNlsPhotoOverlayMutation,
  MutationCreateNlsPhotoOverlayArgs
} from "@reearth/services/gql";
import { CREATE_NLSPHOTOOVERLAY } from "@reearth/services/gql/queries/photoOverlay";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

export const usePhotoOverlayMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createNLSPhotoOverlayMutation] = useMutation<
    CreateNlsPhotoOverlayMutation,
    MutationCreateNlsPhotoOverlayArgs
  >(CREATE_NLSPHOTOOVERLAY, { refetchQueries: ["GetScene"] });

  const createNLSPhotoOverlay = useCallback(
    async (
      input: CreateNlsPhotoOverlayInput
    ): Promise<MutationReturn<CreateNlsPhotoOverlayMutation>> => {
      const { data, error } = await createNLSPhotoOverlayMutation({
        variables: { input }
      });
      if (error || !data?.createNLSPhotoOverlay?.layer?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully enabled photo overlay")
      });

      return { data, status: "success" };
    },
    [createNLSPhotoOverlayMutation, setNotification, t]
  );

  return {
    createNLSPhotoOverlay
  };
};
