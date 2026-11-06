import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GET_CMS_ASSETS,
  GET_CMS_MODELS,
  GET_CMS_PROJECTS
} from "@reearth/services/gql/queries/cms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// CMS pages are 1-based and capped at 100 items.
export const CMS_PAGE_SIZE = 50;
const CMS_MAX_PAGE_SIZE = 100;

// Fetches the page after the loaded items, once at a time, until totalCount
// is reached. The cache appends it (see pageMergeNodes).
const useLoadNextPage = (
  loaded: number,
  totalCount: number,
  fetchPage: (page: number) => Promise<unknown>
) => {
  const loadingRef = useRef(false);
  const hasMore = loaded < totalCount;
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    try {
      await fetchPage(Math.floor(loaded / CMS_PAGE_SIZE) + 1);
    } finally {
      loadingRef.current = false;
    }
  }, [fetchPage, hasMore, loaded]);
  return { hasMore, loadMore };
};

// The workspace's CMS projects, as many as one page holds.
export const useCMSProjects = ({
  workspaceId,
  keyword,
  skip
}: {
  workspaceId?: string;
  keyword?: string;
  skip?: boolean;
}) => {
  const { data, loading, error } = useQuery(GET_CMS_PROJECTS, {
    variables: {
      workspaceId: workspaceId ?? "",
      keyword,
      pageSize: CMS_MAX_PAGE_SIZE
    },
    skip: skip || !workspaceId
  });

  return {
    projects: data?.cmsProjects.nodes,
    totalCount: data?.cmsProjects.totalCount ?? 0,
    loading,
    error
  };
};

type ProjectQueryProps = {
  workspaceId?: string;
  projectId?: string;
  skip?: boolean;
};

export const useCMSModels = ({
  workspaceId,
  projectId,
  skip
}: ProjectQueryProps) => {
  const { data, loading, error, fetchMore } = useQuery(GET_CMS_MODELS, {
    variables: {
      workspaceId: workspaceId ?? "",
      projectId: projectId ?? "",
      page: 1,
      pageSize: CMS_PAGE_SIZE
    },
    skip: skip || !workspaceId || !projectId
  });

  const models = data?.cmsModels.nodes;
  const fetchPage = useCallback(
    (page: number) => fetchMore({ variables: { page } }),
    [fetchMore]
  );
  const { hasMore, loadMore } = useLoadNextPage(
    models?.length ?? 0,
    data?.cmsModels.totalCount ?? 0,
    fetchPage
  );

  return { models, hasMore, loading, error, loadMore };
};

export const useCMSAssets = ({
  workspaceId,
  projectId,
  skip
}: ProjectQueryProps) => {
  const { data, loading, error, fetchMore } = useQuery(GET_CMS_ASSETS, {
    variables: {
      workspaceId: workspaceId ?? "",
      projectId: projectId ?? "",
      page: 1,
      pageSize: CMS_PAGE_SIZE
    },
    skip: skip || !workspaceId || !projectId
  });

  const assets = data?.cmsAssets.nodes;
  const fetchPage = useCallback(
    (page: number) => fetchMore({ variables: { page } }),
    [fetchMore]
  );
  const { hasMore, loadMore } = useLoadNextPage(
    assets?.length ?? 0,
    data?.cmsAssets.totalCount ?? 0,
    fetchPage
  );

  return { assets, hasMore, loading, error, loadMore };
};

type Page<T> = { nodes: T[]; totalCount: number };

// CMS lists models and assets one project at a time, so these query every
// given project in parallel and merge the results. Each project pages on its
// own; loadMore fetches the next page of every project that has more. A
// project that fails (e.g. no access) is left out rather than failing all.
const useAcrossProjects = <T>({
  workspaceId,
  projectIds,
  skip,
  fetchPage
}: {
  workspaceId?: string;
  projectIds: string[];
  skip?: boolean;
  fetchPage: (projectId: string, page: number) => Promise<Page<T>>;
}) => {
  // Pages by project, for the workspace and project list in `key`. Kept while
  // skipped, so returning to all projects shows them again without a reload.
  const [loaded, setLoaded] = useState<{
    key: string;
    pages: Record<string, Page<T>>;
  }>();
  // The key whose first pages are being fetched, so it's fetched only once.
  const inFlightRef = useRef<string>(undefined);
  const loadingMoreRef = useRef(false);

  const fetchPages = useCallback(
    async (targets: { projectId: string; page: number }[]) => {
      const results = await Promise.allSettled(
        targets.map(({ projectId, page }) => fetchPage(projectId, page))
      );
      return targets.flatMap(({ projectId }, i) => {
        const r = results[i];
        return r.status === "fulfilled" ? [{ projectId, page: r.value }] : [];
      });
    },
    [fetchPage]
  );

  const projectKey = projectIds.join(",");
  const requestKey = `${workspaceId}:${projectKey}`;
  const loadedKey = loaded?.key;
  const loading =
    !skip && !!workspaceId && !!projectKey && loadedKey !== requestKey;

  useEffect(() => {
    if (skip || !workspaceId || !projectKey) return;
    if (loadedKey === requestKey || inFlightRef.current === requestKey) return;
    inFlightRef.current = requestKey;
    fetchPages(
      projectKey.split(",").map((projectId) => ({ projectId, page: 1 }))
    ).then((results) => {
      // Superseded by another workspace or project list.
      if (inFlightRef.current !== requestKey) return;
      inFlightRef.current = undefined;
      setLoaded({
        key: requestKey,
        pages: Object.fromEntries(
          results.map(({ projectId, page }) => [projectId, page])
        )
      });
    });
  }, [fetchPages, loadedKey, projectKey, requestKey, skip, workspaceId]);

  const pages = useMemo(
    () => (loaded?.key === requestKey ? loaded.pages : {}),
    [loaded, requestKey]
  );

  const remaining = Object.entries(pages).filter(
    ([, p]) => p.nodes.length < p.totalCount
  );
  const hasMore = remaining.length > 0;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const results = await fetchPages(
        remaining.map(([projectId, p]) => ({
          projectId,
          page: Math.floor(p.nodes.length / CMS_PAGE_SIZE) + 1
        }))
      );
      setLoaded((prev) => {
        if (prev?.key !== requestKey) return prev;
        const next = { ...prev.pages };
        for (const { projectId, page } of results) {
          next[projectId] = {
            totalCount: page.totalCount,
            nodes: [...(next[projectId]?.nodes ?? []), ...page.nodes]
          };
        }
        return { key: requestKey, pages: next };
      });
    } finally {
      loadingMoreRef.current = false;
    }
  }, [fetchPages, hasMore, remaining, requestKey]);

  const nodes = useMemo(
    () => Object.values(pages).flatMap((p) => p.nodes),
    [pages]
  );

  return { nodes, hasMore, loading, loadMore };
};

type AcrossProjectsProps = {
  workspaceId?: string;
  projectIds: string[];
  skip?: boolean;
};

// Bypasses the cache: these pages are merged here, not by pageMergeNodes.
export const useCMSModelsAcrossProjects = ({
  workspaceId,
  ...props
}: AcrossProjectsProps) => {
  const client = useApolloClient();
  const fetchPage = useCallback(
    async (projectId: string, page: number) => {
      const { data } = await client.query({
        query: GET_CMS_MODELS,
        variables: {
          workspaceId: workspaceId ?? "",
          projectId,
          page,
          pageSize: CMS_PAGE_SIZE
        },
        fetchPolicy: "no-cache"
      });
      if (!data) throw new Error("No CMS models returned");
      return data.cmsModels;
    },
    [client, workspaceId]
  );
  const { nodes, ...rest } = useAcrossProjects({
    workspaceId,
    ...props,
    fetchPage
  });
  return { models: nodes, ...rest };
};

export const useCMSAssetsAcrossProjects = ({
  workspaceId,
  ...props
}: AcrossProjectsProps) => {
  const client = useApolloClient();
  const fetchPage = useCallback(
    async (projectId: string, page: number) => {
      const { data } = await client.query({
        query: GET_CMS_ASSETS,
        variables: {
          workspaceId: workspaceId ?? "",
          projectId,
          page,
          pageSize: CMS_PAGE_SIZE
        },
        fetchPolicy: "no-cache"
      });
      if (!data) throw new Error("No CMS assets returned");
      return data.cmsAssets;
    },
    [client, workspaceId]
  );
  const { nodes, ...rest } = useAcrossProjects({
    workspaceId,
    ...props,
    fetchPage
  });
  return { assets: nodes, ...rest };
};
