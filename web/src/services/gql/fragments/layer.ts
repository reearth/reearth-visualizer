import { gql } from "@apollo/client";

export const nlsLayerSimpleFragment = gql`
  fragment NLSLayerCommon on NLSLayer {
    id
    index
    layerType
    sceneId
    config
    title
    visible
    infobox {
      sceneId
      layerId
      propertyId
      property {
        id
        ...PropertyFragment
      }
      blocks {
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
    photoOverlay {
      layerId
      propertyId
      property {
        id
        ...PropertyFragment
      }
    }
    isSketch
    sketch {
      customPropertySchema
      featureCollection {
        type
        features {
          ...FeatureFragment
        }
      }
    }
    ... on NLSLayerGroup {
      children {
        id
      }
    }
  }
`;
