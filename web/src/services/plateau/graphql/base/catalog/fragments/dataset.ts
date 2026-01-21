import { gql } from "../__gen__";

export const DATASET_FRAGMENT = gql(`
  fragment DatasetFragment on Dataset {
    id
    name
    description
    year
    groups
    openDataUrl
    prefectureId
    prefectureCode
    cityId
    cityCode
    wardId
    wardCode
    prefecture {
      name
      code
    }
    city {
      name
      code
    }
    ward {
      name
      code
    }
    type {
      id
      code
      name
      category
      order
    }
    items {
      id
      format
      name
      url
      layers
    }
    admin
    ... on PlateauDataset {
      subname
      plateauSpecMinor {
        majorVersion
      }
    }
  }
`);
