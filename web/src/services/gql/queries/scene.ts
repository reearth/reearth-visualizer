import { gql } from "@reearth/services/gql/__gen__";

export const GET_SCENE = gql(`
  query GetScene($sceneId: ID!, $lang: Lang) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        teamId
        projectId
        property {
          id
          ...PropertyFragment
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
      }
    }
  }
`);

export const CHECK_SCENE_ALIAS = gql(`
  query CheckSceneAlias($alias: String!, $projectId: ID){
    checkSceneAlias(alias: $alias, projectId: $projectId) {
      alias
      available
    }
  }
`);
