import { useEffect, useRef, useState } from "react";

import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";

import { Datasets, DatasetMap } from "./convert";

export function useDatasets(datasetSchemaIds: string[] | undefined) {
  const auth = useAuth();
  const [results, setResults] = useState<DatasetMap>({});
  const [loaded, setLoaded] = useState(false);
  const fetched = useRef<string[]>([]);

  useEffect(() => {
    if (!datasetSchemaIds) return;
    if (datasetSchemaIds.length === 0) {
      setLoaded(true);
      return;
    }

    const newIds = datasetSchemaIds.filter(d => !fetched.current.includes(d));
    if (newIds.length === 0) return;

    fetched.current = [...fetched.current, ...newIds];
    console.log("fetching datasets", newIds);

    (async () => {
      const accessToken = await auth.getAccessToken();

      const results: DatasetMap = {};
      await Promise.all(
        newIds.map(id =>
          fetchDatasets(id, config()?.api || "/api", accessToken)
            .then(datasets => {
              results[id] = datasets;
            })
            .catch(err => {
              console.error("failed to fetch datasets: " + id, err);
              throw err;
            }),
        ),
      );
      setResults(r => ({ ...r, ...results }));
      setLoaded(true);
    })();
  }, [auth, datasetSchemaIds]);

  return { datasets: results, loaded };
}

async function fetchDatasets(
  datasetSchemaId: string,
  base: string,
  token: string,
): Promise<Datasets> {
  const res = await fetch(`${base}/datasets/${datasetSchemaId}.json`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  if (res.status !== 200) throw new Error("Failed to fetch datasets: " + datasetSchemaId);

  return (await res.json()) as Datasets;
}
