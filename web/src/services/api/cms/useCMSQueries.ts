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

// Fetches the page after the last one loaded, once at a time, until
// totalCount is covered. The cache appends it (see pageMergeNodes). The last
// page is remembered, as a page shorter than pageSize would throw off one
// derived from the item count; that is used only for pages already cached
// when `key` (the query's variables) started. Stops at a page that fails.
const useNextPage = ({
  key,
  loaded,
  totalCount,
  pageSize,
  fetchPage
}: {
  key: string;
  loaded: number;
  totalCount: number;
  pageSize: number;
  fetchPage: (page: number) => Promise<unknown>;
}) => {
  const [last, setLast] = useState<{ key: string; page: number }>();
  const [failed, setFailed] = useState<{ key: string; error: unknown }>();
  const page =
    last?.key === key ? last.page : Math.max(1, Math.ceil(loaded / pageSize));
  const error = failed?.key === key ? failed.error : undefined;
  const hasMore = loaded > 0 && !error && page * pageSize < totalCount;
  const loadingRef = useRef(false);
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    try {
      await fetchPage(page + 1);
      setLast({ key, page: page + 1 });
    } catch (e) {
      setFailed({ key, error: e });
    } finally {
      loadingRef.current = false;
    }
  }, [fetchPage, hasMore, key, page]);
  return { hasMore, loadMore, error };
};

// All of the workspace's CMS projects: the pages after the first are fetched
// in turn until totalCount is reached (the cache appends them), or a page
// fails, which is returned as the error.
export const useCMSProjects = ({
  workspaceId,
  keyword,
  skip
}: {
  workspaceId?: string;
  keyword?: string;
  skip?: boolean;
}) => {
  const { data, loading, error, fetchMore } = useQuery(GET_CMS_PROJECTS, {
    variables: {
      workspaceId: workspaceId ?? "",
      keyword,
      page: 1,
      pageSize: CMS_MAX_PAGE_SIZE
    },
    skip: skip || !workspaceId
  });

  const projects = data?.cmsProjects.nodes;
  const totalCount = data?.cmsProjects.totalCount ?? 0;
  const fetchPage = useCallback(
    (page: number) => fetchMore({ variables: { page } }),
    [fetchMore]
  );
  const next = useNextPage({
    key: `${workspaceId}:${keyword ?? ""}`,
    loaded: projects?.length ?? 0,
    totalCount,
    pageSize: CMS_MAX_PAGE_SIZE,
    fetchPage
  });
  const hasMore = !skip && !error && next.hasMore;
  const { loadMore } = next;
  useEffect(() => {
    if (hasMore && !loading) loadMore();
  }, [hasMore, loadMore, loading]);

  return {
    projects,
    totalCount,
    loading: loading || hasMore,
    error: error ?? next.error
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
  const next = useNextPage({
    key: `${workspaceId}:${projectId}`,
    loaded: models?.length ?? 0,
    totalCount: data?.cmsModels.totalCount ?? 0,
    pageSize: CMS_PAGE_SIZE,
    fetchPage
  });

  return {
    models,
    hasMore: next.hasMore,
    loading,
    error: error ?? next.error,
    loadMore: next.loadMore
  };
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
  const next = useNextPage({
    key: `${workspaceId}:${projectId}`,
    loaded: assets?.length ?? 0,
    totalCount: data?.cmsAssets.totalCount ?? 0,
    pageSize: CMS_PAGE_SIZE,
    fetchPage
  });

  return {
    assets,
    hasMore: next.hasMore,
    loading,
    error: error ?? next.error,
    loadMore: next.loadMore
  };
};

type Page<T> = { nodes: T[]; totalCount: number };
// A project's pages so far, up to page `page`.
type Loaded<T> = Page<T> & { page: number };

// CMS lists models and assets one project at a time, so these query every
// given project in parallel and merge the results. Each project pages on its
// own; loadMore fetches the next page of every project that has more. A
// project whose page fails (e.g. no access) is left out rather than failing
// all, and counted in `failedCount`; loadMore skips it, and it's tried again
// when the hook is used again (unskipped).
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
    pages: Record<string, Loaded<T>>;
    failed: string[];
  }>();
  // The key whose first pages are being fetched, so it's fetched only once.
  const inFlightRef = useRef<string>(undefined);
  const loadingMoreRef = useRef(false);

  const projectKey = projectIds.join(",");
  const requestKey = `${workspaceId}:${projectKey}`;
  const requestKeyRef = useRef(requestKey);
  requestKeyRef.current = requestKey;

  // Fetches the given projects' pages and adds them to what's loaded for
  // `key`: a first page replaces the project's, a later one is appended. A
  // project that fails is marked failed; one that loads, no longer. Dropped
  // when `key` is no longer the one asked for.
  const fetchPages = useCallback(
    async (key: string, targets: { projectId: string; page: number }[]) => {
      const results = await Promise.allSettled(
        targets.map(({ projectId, page }) => fetchPage(projectId, page))
      );
      // Superseded by another workspace or project list.
      if (key !== requestKeyRef.current) return;
      setLoaded((prev) => {
        const base = prev?.key === key ? prev : { pages: {}, failed: [] };
        const pages: Record<string, Loaded<T>> = { ...base.pages };
        const failed = base.failed.filter(
          (id) => !targets.some((t) => t.projectId === id)
        );
        targets.forEach(({ projectId, page }, i) => {
          const r = results[i];
          if (r.status === "rejected") {
            failed.push(projectId);
            return;
          }
          pages[projectId] = {
            totalCount: r.value.totalCount,
            nodes: [
              ...(page > 1 ? (pages[projectId]?.nodes ?? []) : []),
              ...r.value.nodes
            ],
            page
          };
        });
        return { key, pages, failed };
      });
    },
    [fetchPage]
  );

  const loadedKey = loaded?.key;
  const loading =
    !skip && !!workspaceId && !!projectKey && loadedKey !== requestKey;

  useEffect(() => {
    if (skip || !workspaceId || !projectKey) return;
    if (loadedKey === requestKey || inFlightRef.current === requestKey) return;
    inFlightRef.current = requestKey;
    fetchPages(
      requestKey,
      projectKey.split(",").map((projectId) => ({ projectId, page: 1 }))
    ).then(() => {
      if (inFlightRef.current === requestKey) inFlightRef.current = undefined;
    });
  }, [fetchPages, loadedKey, projectKey, requestKey, skip, workspaceId]);

  const pages = useMemo(
    () => (loaded?.key === requestKey ? loaded.pages : {}),
    [loaded, requestKey]
  );
  const failed = useMemo(
    () => (loaded?.key === requestKey ? loaded.failed : []),
    [loaded, requestKey]
  );

  // The page each failed project is retried from.
  const retryTargets = useCallback(
    () =>
      failed.map((projectId) => ({
        projectId,
        page: (pages[projectId]?.page ?? 0) + 1
      })),
    [failed, pages]
  );

  // Back from skipped (e.g. one project picked, then all projects again):
  // retry the projects that failed, keeping what loaded.
  const wasSkippedRef = useRef(skip);
  useEffect(() => {
    const returned = wasSkippedRef.current && !skip;
    wasSkippedRef.current = skip;
    if (!returned || !failed.length) return;
    fetchPages(requestKey, retryTargets());
  }, [failed.length, fetchPages, requestKey, retryTargets, skip]);

  const remaining = Object.entries(pages).filter(
    ([projectId, p]) =>
      !failed.includes(projectId) && p.page * CMS_PAGE_SIZE < p.totalCount
  );
  const hasMore = remaining.length > 0;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      await fetchPages(
        requestKey,
        remaining.map(([projectId, p]) => ({ projectId, page: p.page + 1 }))
      );
    } finally {
      loadingMoreRef.current = false;
    }
  }, [fetchPages, hasMore, remaining, requestKey]);

  const nodes = useMemo(
    () => Object.values(pages).flatMap((p) => p.nodes),
    [pages]
  );

  return { nodes, hasMore, loading, loadMore, failedCount: failed.length };
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
