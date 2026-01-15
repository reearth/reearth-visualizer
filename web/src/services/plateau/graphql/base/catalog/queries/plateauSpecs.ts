import { gql } from "../__gen__/gql";

export const PLATEAU_SPECS = gql(`
query PlateauSpecs {
  plateauSpecs {
    majorVersion
  }
}
`);
