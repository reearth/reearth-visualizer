import { FetchResult } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { CreateAssetInput, CreateAssetMutation } from "@reearth/services/gql";
import {
  CREATE_ASSET,
  REMOVE_ASSET
} from "@reearth/services/gql/queries/asset";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const useAssetMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const apolloCache = useApolloClient().cache;

  const [createAssetMutation] = useMutation(CREATE_ASSET, {
    refetchQueries: ["GetAssets"]
  });

  const createAssets = useCallback(
    async ({
      workspaceId,
      projectId,
      file
    }: CreateAssetInput): Promise<
      | {
          data: FetchResult<CreateAssetMutation>[];
          result: string;
        }
      | undefined
    > => {
      if (!file || !workspaceId || !projectId) return;

      try {
        const results = await Promise.all(
          Array.from(file).map((f) =>
            createAssetMutation({
              variables: { workspaceId, projectId, file: f, coreSupport: true }
            })
          )
        );

        if (!results || results.some((r) => r.errors)) {
          setNotification({
            type: "error",
            text: t("Failed to add one or more assets.")
          });
        } else {
          setNotification({
            type: "success",
            text: t("Successfully added one or more assets.")
          });
        }

        apolloCache.evict({ fieldName: "assets" });

        return { data: results, result: "success" };
      } catch (_error) {
        setNotification({
          type: "error",
          text: t("Failed to add one or more assets.")
        });
        return;
        // TODO: add 'error' to error tracking
      }
    },
    [apolloCache, createAssetMutation, t, setNotification]
  );

  const [removeAssetMutation] = useMutation(REMOVE_ASSET, {
    refetchQueries: ["GetAssets"]
  });

  const removeAssets = useCallback(
    async (assetIds: string[]) => {
      const results = await Promise.all(
        assetIds.map((assetId) =>
          removeAssetMutation({ variables: { assetId } })
        )
      );

      if (!results || results.some((r) => r.errors)) {
        setNotification({
          type: "error",
          text: t("Failed to delete one or more assets.")
        });
      } else {
        setNotification({
          type: "success",
          text: t("One or more assets were successfully deleted.")
        });
      }

      return {
        status: !results || results.some((r) => r.errors) ? "error" : "success"
      };
    },
    [removeAssetMutation, t, setNotification]
  );

  return {
    createAssets,
    removeAssets
  };
};
