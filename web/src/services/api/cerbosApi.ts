import { useState, useCallback } from "react";

import { useAuth } from "@reearth/services/auth";

export default () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getAccessToken } = useAuth();

  const checkPermission = useCallback(
    async (resource: string, action: string) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = await getAccessToken();

        const response = await fetch("http://localhost:8090/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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
                service: "visualizer",
                resource,
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
    },
    [getAccessToken],
  );

  return {
    checkPermission,
    data,
    loading,
    error,
  };
};
