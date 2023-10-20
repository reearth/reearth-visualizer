import { GetSceneQuery } from "../../gql";

export type LayerStyle = {
  id: string;
  name: string;
  value?: any;
};

export const getLayerStyles = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.styles?.map((s): LayerStyle => {
    return {
      id: s.id,
      name: s.name,
      value: s.value,
    };
  });
};
