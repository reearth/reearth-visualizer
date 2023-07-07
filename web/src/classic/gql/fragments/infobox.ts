import { gql } from "@apollo/client";

import propertyFragment from "./property";

const infoboxFragment = gql`
  fragment InfoboxFragment on Infobox {
    propertyId
    property {
      id
      ...PropertyFragment
    }
    fields {
      id
      pluginId
      extensionId
      propertyId
      property {
        id
        ...PropertyFragment
      }
    }
  }

  fragment MergedInfoboxFragment on MergedInfobox {
    property {
      ...MergedPropertyFragment
    }
    fields {
      originalId
      pluginId
      extensionId
      property {
        ...MergedPropertyFragment
      }
    }
  }

  ${propertyFragment}
`;

export default infoboxFragment;
