import { useState, useEffect } from "react";

import importModule from "./import";

const useImport = <T = any>(
  url: string,
  skip?: boolean,
): { data: T | undefined; loading: boolean; error: any } => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>();

  useEffect(() => {
    if (skip) return;
    setLoading(true);
    importModule<T>(url)
      .then(module => {
        setData(module);
      })
      .catch((err: any) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skip, url]);

  return { data, loading, error };
};

export default useImport;
