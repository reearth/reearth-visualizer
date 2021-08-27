import { useEffect } from "react";

import { useAuth } from "@reearth/auth";
import { useSceneId, useRootLayerId } from "@reearth/state";
import { useGetSceneQuery } from "@reearth/gql";

export type Mode = "layer" | "widget";

export default (sceneId?: string) => {
  const isAuthenticated = useAuth();
  const [, setRootLayerId] = useRootLayerId();
  const [, setSceneId] = useSceneId();

  const { loading, data } = useGetSceneQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });

  useEffect(() => {
    setSceneId(sceneId);
  }, [sceneId, setSceneId]);

  useEffect(() => {
    setRootLayerId(
      (data?.node && data.node.__typename === "Scene" ? data.node : undefined)?.rootLayerId,
    );
  }, [data?.node, setRootLayerId]);

  return {
    loading,
    loaded: !!data,
  };
};
