import { gql } from "../__gen__/gql";

export const DATASET_TYPES = gql(`
query DatasetTypes($input: DatasetTypesInput) {
  datasetTypes(input: $input) {
    id
    name
    code
    order
  }
}
`);
