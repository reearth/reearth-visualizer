import { PLATEAU_SPECS } from "../../base/catalog/queries/plateauSpecs";

import { useQuery } from "./base";

export const usePlateauSpecs = () => {
  const { data, ...rest } = useQuery(PLATEAU_SPECS);
  return { data, ...rest };
};
