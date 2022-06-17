import { gql } from "@apollo/client";

import { propertyFragment, infoboxFragment } from "@reearth/gql/fragments";

export const LayerSystemFragments = gql`
  fragment LayerSystemLayer on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    ... on LayerItem {
      linkedDatasetId
    }
  }

  fragment LayerSystemLayer1 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer
      }
    }
  }

  fragment LayerSystemLayer2 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer1
      }
    }
  }

  fragment LayerSystemLayer3 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer2
      }
    }
  }

  fragment LayerSystemLayer4 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer3
      }
    }
  }

  fragment LayerSystemLayer5 on Layer {
    id
    ...LayerSystemLayer
    ... on LayerGroup {
      layers {
        id
        ...LayerSystemLayer4
      }
    }
  }
`;

export const EarthLayerFragments = gql`
  fragment EarthLayerCommon on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    propertyId
    property {
      id
      ...PropertyFragmentWithoutSchema
    }
    tags {
      tagId
      tag {
        id
        label
      }
      ... on LayerTagGroup {
        children {
          tagId
          tag {
            id
            label
          }
        }
      }
    }
    infobox {
      propertyId
      property {
        id
        ...PropertyFragmentWithoutSchema
      }
      fields {
        id
        pluginId
        extensionId
        propertyId
        scenePlugin {
          property {
            id
            ...PropertyFragment
          }
        }
        property {
          id
          ...PropertyFragmentWithoutSchema
        }
      }
    }
  }

  fragment EarthLayerItem on LayerItem {
    id
    linkedDatasetId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    merged {
      parentId
      property {
        ...MergedPropertyFragmentWithoutSchema
      }
      infobox {
        property {
          ...MergedPropertyFragmentWithoutSchema
        }
        fields {
          originalId
          pluginId
          extensionId
          property {
            ...MergedPropertyFragmentWithoutSchema
          }
          scenePlugin {
            property {
              id
              ...PropertyFragment
            }
          }
        }
      }
    }
  }

  fragment EarthLayer on Layer {
    id
    ...EarthLayerCommon
    ...EarthLayerItem
  }

  fragment EarthLayer1 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer
      }
    }
  }

  fragment EarthLayer2 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer1
      }
    }
  }

  fragment EarthLayer3 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer2
      }
    }
  }

  fragment EarthLayer4 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer3
      }
    }
  }

  fragment EarthLayer5 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer4
      }
    }
  }

  ${propertyFragment}
`;

export const layerFragment = gql`
  fragment LayerFragment on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    property {
      id
      ...PropertyFragment
    }
    infobox {
      ...InfoboxFragment
    }
    ... on LayerGroup {
      linkedDatasetSchemaId
    }
    ... on LayerItem {
      linkedDatasetId
      merged {
        parentId
        property {
          ...MergedPropertyFragment
        }
        infobox {
          ...MergedInfoboxFragment
        }
      }
    }
  }

  fragment Layer0Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
      }
    }
  }

  fragment Layer1Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
        ...LayerFragment
      }
    }
  }

  fragment Layer2Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
        ...LayerFragment
        ... on LayerGroup {
          layers {
            id
            ...LayerFragment
          }
        }
      }
    }
  }

  fragment Layer3Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
        ...LayerFragment
        ... on LayerGroup {
          layers {
            id
            ...LayerFragment
            ... on LayerGroup {
              layers {
                id
                ...LayerFragment
              }
            }
          }
        }
      }
    }
  }

  fragment Layer4Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
        ...LayerFragment
        ... on LayerGroup {
          layers {
            id
            ...LayerFragment
            ... on LayerGroup {
              layers {
                id
                ...LayerFragment
                ... on LayerGroup {
                  layers {
                    id
                    ...LayerFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fragment Layer5Fragment on Layer {
    id
    ...LayerFragment
    ... on LayerGroup {
      layers {
        id
        ...LayerFragment
        ... on LayerGroup {
          layers {
            id
            ...LayerFragment
            ... on LayerGroup {
              layers {
                id
                ...LayerFragment
                ... on LayerGroup {
                  layers {
                    id
                    ...LayerFragment
                    ... on LayerGroup {
                      layers {
                        id
                        ...LayerFragment
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  ${infoboxFragment}
`;
