import { useEffect } from "react";

import { useAuth } from "@reearth/auth";
import { useSetLocalState } from "@reearth/state";
import { useGetSceneQuery } from "@reearth/gql";

export type Mode = "layer" | "widget";

export default (sceneId?: string) => {
  const isAuthenticated = useAuth();
  const setLocalState = useSetLocalState();

  const { loading, data } = useGetSceneQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });

  useEffect(() => {
    setLocalState({ sceneId });
  }, [sceneId, setLocalState]);

  useEffect(() => {
    setLocalState({
      rootLayerId: (data?.node && data.node.__typename === "Scene" ? data.node : undefined)
        ?.rootLayerId,
    });
  }, [data?.node, setLocalState]);

  return {
    loading,
    loaded: !!data,
  };
};
