import { gql } from "@reearth/services/gql/__gen__";

export const ADD_WIDGET =
  gql(` mutation AddWidget($sceneId: ID!, $pluginId: ID!, $extensionId: ID!, $lang: Lang) {
    addWidget(
      input: {sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId}
    ) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
      }
      sceneWidget {
        id
        enabled
        pluginId
        extensionId
      }
    }
  }`);

export const REMOVE_WIDGET = gql(`
  mutation RemoveWidget($sceneId: ID!, $widgetId: ID!) {
    removeWidget(input: { sceneId: $sceneId, widgetId: $widgetId }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`);
