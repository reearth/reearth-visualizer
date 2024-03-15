import { GetSceneQuery } from "../../gql";

export type NLSLayer = {
  id: string;
  title: string;
  visible: boolean;
  layerType: string;
  config?: any;
  children?: NLSLayer[] | null;
  infobox?: any;
};

export const getLayers = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.newLayers?.map((l): NLSLayer => {
    return {
      id: l.id,
      title: l.title,
      visible: l.visible,
      layerType: l.layerType,
      config: l.config,
      infobox: l.infobox,
    };
  });
};
