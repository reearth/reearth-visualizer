import { gql } from "@reearth/services/gql/__gen__";

export const GET_SCENE = gql(`
  query GetScene($sceneId: ID!, $lang: Lang) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayerId
        teamId
        projectId
        property {
          id
          ...PropertyFragment
        }
        clusters {
          id
          name
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
        tags {
          id
          label
          ... on TagGroup {
            tags {
              id
              label
            }
          }
        }
        plugins {
          property {
            id
            ...PropertyFragment
          }
          plugin {
            ...PluginFragment
          }
        }
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          property {
            id
            ...PropertyFragment
          }
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
        stories {
          ...StoryFragment
        }
        newLayers {
          ...NLSLayerCommon
        }
        styles {
          ...NLSLayerStyle
        }
      }
    }
  }
`);

export const CREATE_SCENE = gql(`
  mutation CreateScene($projectId: ID!) {
    createScene(input: { projectId: $projectId }) {
      scene {
        id
        stories{
          id
        }
      }
    }
  }
`);
