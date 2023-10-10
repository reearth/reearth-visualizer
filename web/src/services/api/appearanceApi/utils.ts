import { GetSceneQuery } from "../../gql";

export type NLSAppearance = {
  id: string;
  name: string;
  value?: any;
};

export const getAppearances = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.styles?.map((l): NLSAppearance => {
    return {
      id: l.id,
      name: l.name,
      value: l.value,
    };
  });
};
