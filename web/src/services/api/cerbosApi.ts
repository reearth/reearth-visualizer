import { useState, useCallback } from "react";

export default () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = useCallback(async (roles: string[], action: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8090/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query CheckPermission($input: CheckPermissionInput!) {
              checkPermission(input: $input) {
                allowed
              }
            }
          `,
          variables: {
            input: {
              resource: "visualizer",
              roles,
              action,
            },
          },
        }),
      });

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkPermission,
    data,
    loading,
    error,
  };
};
