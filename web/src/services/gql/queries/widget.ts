import { gql } from "@reearth/services/gql/__gen__";

export const ADD_WIDGET =
  gql(` mutation AddWidget($sceneId: ID!, $pluginId: ID!, $extensionId: ID!, $lang: Lang, $type: WidgetAlignSystemType!) {
    addWidget(
      input: {type: $type, sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId}
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
    $type: WidgetAlignSystemType!
    $sceneId: ID!
    $widgetId: ID!
    $enabled: Boolean
    $location: WidgetLocationInput
    $extended: Boolean
    $index: Int
  ) {
    updateWidget(
      input: {
        type: $type
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
  mutation RemoveWidget($sceneId: ID!, $widgetId: ID!, $type: WidgetAlignSystemType!) {
    removeWidget(input: { type: $type, sceneId: $sceneId, widgetId: $widgetId }) {
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
    $type: WidgetAlignSystemType!
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
        type: $type
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
          desktop {
            ...WidgetAlignSystemFragment
          }
          mobile {
            ...WidgetAlignSystemFragment
          }
        }
      }
    }
  }
`);
