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

export const UPDATE_WIDGET = gql(`
  mutation UpdateWidget(
    $sceneId: ID!
    $widgetId: ID!
    $enabled: Boolean
    $location: WidgetLocationInput
    $extended: Boolean
    $index: Int
  ) {
    updateWidget(
      input: {
        sceneId: $sceneId
        widgetId: $widgetId
        enabled: $enabled
        location: $location
        extended: $extended
        index: $index
      }
    ) {
      scene {
        id
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`);

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

export const UPDATE_WIDGET_ALIGN_SYSTEM = gql(`
  mutation UpdateWidgetAlignSystem(
    $sceneId: ID!
    $location: WidgetLocationInput!
    $align: WidgetAreaAlign
    $padding: WidgetAreaPaddingInput
    $gap: Int
    $centered: Boolean
    $background: String
  ) {
    updateWidgetAlignSystem(
      input: {
        sceneId: $sceneId
        location: $location
        align: $align
        padding: $padding
        gap: $gap
        centered: $centered
        background: $background
      }
    ) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
      }
    }
  }
`);
