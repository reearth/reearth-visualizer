import { atom } from "jotai";
import { groupBy } from "lodash-es";

import { fetchData } from "../data";
import type { Feature, Data, DataRange } from "../types";

import { doubleKeyCacheAtom } from "./cache";

export const globalDataFeaturesCache = doubleKeyCacheAtom<string, string, Feature[]>();

export function dataAtom(cacheAtoms = globalDataFeaturesCache) {
  const fetching = atom<[string, string, AbortController][]>([]);

  const get = atom(
    get => (layerId: string, data: Data, range?: DataRange) =>
      get(cacheAtoms.get)(dataKey(layerId, data), rangeKey(range)),
  );

  const getAll = atom(
    get => (layerId: string, data: Data) => get(cacheAtoms.getAll)(dataKey(layerId, data)),
  );

  const set = atom(
    null,
    async (_get, set, value: { data: Data; features: Feature[]; layerId: string }) => {
      Object.entries(groupBy(value.features, f => rangeKey(f.range))).forEach(([k, v]) => {
        set(cacheAtoms.set, {
          key: dataKey(value.layerId, value.data),
          key2: k,
          value: v,
        });
      });
    },
  );

  const deleteAll = atom(
    null,
    async (get, set, value: { data: Data; features: string[]; layerId: string }) => {
      const d = dataKey(value.layerId, value.data);
      Object.entries(
        groupBy(
          get(getAll)(value.layerId, value.data)
            ?.filter(f => f.length)
            .map(
              f =>
                [rangeKey(f[0].range), f, f.filter(g => !value.features.includes(g.id))] as const,
            )
            .filter(f => f[1].length !== f[2].length),
          g => g[0],
        ),
      ).forEach(([k, f]) => {
        set(cacheAtoms.set, {
          key: d,
          key2: k,
          value: f.flatMap(g => g[2]),
        });
      });
    },
  );

  const fetch = atom(
    null,
    async (
      get,
      set,
      value: { data: Data; range?: DataRange; layerId: string; forceUpdateData?: boolean },
    ) => {
      const k = dataKey(value.layerId, value.data);
      if (!k) return;

      const rk = rangeKey(value.range);
      const cached =
        !value.forceUpdateData && !value.data.value && value.data.url
          ? get(cacheAtoms.get)(k, rk)
          : undefined;
      if (cached) return;
      const status = get(fetching).find(e => e[0] === k && e[1] === rk);
      if (status) {
        status[2].abort();
      }

      try {
        const abort = new AbortController();
        set(fetching, f => [...f, [k, rk, abort]]);
        const features = await fetchData(value.data, value.range, { signal: abort.signal });
        if (features) {
          set(cacheAtoms.set, { key: k, key2: rk, value: features });
        }
      } catch (e) {
        // Do nothing
      } finally {
        set(fetching, f => f.filter(e => e[0] !== k || e[1] !== rk));
      }
    },
  );

  return {
    get,
    getAll,
    set,
    fetch,
    deleteAll,
  };
}

export const DATA_CACHE_KEYS: (keyof Pick<Data, "type" | "url">)[] = ["type", "url"];

function dataKey(layerId: string, data: Data): string {
  return !data.value && data.url ? DATA_CACHE_KEYS.map(k => data[k]).join(":") : `layer:${layerId}`;
}

function rangeKey(range?: DataRange): string {
  return range ? `${range.x}:${range.y}:${range.z}` : "";
}
