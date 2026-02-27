import { useMutation } from "@apollo/client/react";
import {
  CreateNlsInfoboxInput,
  CreateNlsInfoboxMutation,
  MutationCreateNlsInfoboxArgs
} from "@reearth/services/gql";
import { CREATE_NLSINFOBOX } from "@reearth/services/gql/queries/infobox";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

export const useInfoboxMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createNLSInfoboxMutation] = useMutation<
    CreateNlsInfoboxMutation,
    MutationCreateNlsInfoboxArgs
  >(CREATE_NLSINFOBOX, { refetchQueries: ["GetScene"] });

  const createNLSInfobox = useCallback(
    async (
      input: CreateNlsInfoboxInput
    ): Promise<MutationReturn<CreateNlsInfoboxMutation>> => {
      const { data, error } = await createNLSInfoboxMutation({
        variables: { input }
      });
      if (error || !data?.createNLSInfobox?.layer?.id) {
        setNotification({ type: "error", text: t("Failed to add layer.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully added a new layer")
      });

      return { data, status: "success" };
    },
    [createNLSInfoboxMutation, setNotification, t]
  );

  return {
    createNLSInfobox
  };
};
