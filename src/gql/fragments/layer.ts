import { gql } from "@apollo/client";

import infoboxFragment from "./infobox";

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
    # plugin {
    #   id
    #   scenePlugin(sceneId: $sceneId) {
    #     property {
    #       id
    #       ...PropertyFragment
    #     }
    #   }
    # }
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

export default layerFragment;
