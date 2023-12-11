import { gql } from "@apollo/client";

export const pluginFragment = gql(`
  fragment PluginFragment on Plugin {
    id
    name
    extensions {
      extensionId
      description
      name
      translatedDescription(lang: $lang)
      translatedName(lang: $lang)
      icon
      singleOnly
      type
      widgetLayout {
        extendable {
          vertically
          horizontally
        }
        extended
        floating
        defaultLocation {
          zone
          section
          area
        }
      }
    }
  }
`);

export default pluginFragment;
