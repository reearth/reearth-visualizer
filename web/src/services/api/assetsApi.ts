import {
  FetchResult,
  useApolloClient,
  useMutation,
  useQuery
} from "@apollo/client";
import {
  CreateAssetInput,
  GetAssetsQueryVariables,
  GetAssetsQuery,
  CreateAssetMutation
} from "@reearth/services/gql";
import {
  CREATE_ASSET,
  GET_ASSETS,
  REMOVE_ASSET
} from "@reearth/services/gql/queries/asset";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useMemo } from "react";

export type AssetNodes = NonNullable<
  GetAssetsQuery["assets"]["nodes"][number]
>[];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const apolloCache = useApolloClient().cache;

  const useAssetsQuery = useCallback((input: GetAssetsQueryVariables) => {
    const { data, loading, networkStatus, fetchMore, ...rest } = useQuery(
      GET_ASSETS,
      {
        variables: input,
        skip: !input.teamId
      }
    );

    const assets = useMemo(
      () => data?.assets.edges?.map((e) => e.node) as AssetNodes,
      [data?.assets]
    );

    const hasMoreAssets = useMemo(
      () =>
        data?.assets.pageInfo?.hasNextPage ||
        data?.assets.pageInfo?.hasPreviousPage,
      [data?.assets]
    );
    const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
    const endCursor = useMemo(
      () => data?.assets.pageInfo?.endCursor,
      [data?.assets]
    );

    return {
      assets,
      hasMoreAssets,
      isRefetching,
      endCursor,
      loading,
      fetchMore,
      ...rest
    };
  }, []);

  const [createAssetMutation] = useMutation(CREATE_ASSET, {
    refetchQueries: ["GetAssets"]
  });

  const useCreateAssets = useCallback(
    async ({
      teamId,
      projectId,
      file
    }: CreateAssetInput): Promise<
      | {
          data: FetchResult<CreateAssetMutation>[];
          result: string;
        }
      | undefined
    > => {
      if (!file || !teamId || !projectId) return;

      try {
        const results = await Promise.all(
          Array.from(file).map((f) =>
            createAssetMutation({
              variables: { teamId, projectId, file: f, coreSupport: true }
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

  const useRemoveAssets = useCallback(
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
    useAssetsQuery,
    useCreateAssets,
    useRemoveAssets
  };
};
