import { gql } from "@apollo/client";

const pluginFragment = gql`
  fragment PluginFragment on Plugin {
    id
    name
    extensions {
      extensionId
      type
      name
      description
      icon
      translatedName
    }
  }
`;

export default pluginFragment;
