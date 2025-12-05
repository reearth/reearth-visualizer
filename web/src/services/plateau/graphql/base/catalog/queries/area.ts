import { gql } from "../__gen__/gql";

export const AREAS = gql(`
query Areas($input: AreasInput!) {
  areas(input: $input) {
    id
    code
    name
  }
}
`);

export const AREA_DATASETS = gql(`
query AreaDatasets($code: AreaCode!, $input: DatasetsInput!) {
  area(code: $code) {
    id
    code
    name
    datasets(input: $input) {
      ...DatasetFragment
    }
  }
}
`);
