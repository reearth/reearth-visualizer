import { gql } from "@apollo/client";

const datasetFragment = gql`
  fragment DatasetFragment on Dataset {
    id
    source
    schemaId
    fields {
      fieldId
      type
      value
      field {
        id
        name
      }
    }
    name
  }
`;

export default datasetFragment;
