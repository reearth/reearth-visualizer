import { gql } from "@reearth/services/gql/__gen__";

export const INSTALL_PLUGIN = gql(`
  mutation InstallPlugin($sceneId: ID!, $pluginId: ID!) {
    installPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`);

export const UPGRADE_PLUGIN = gql(`
  mutation UpgradePlugin($sceneId: ID!, $pluginId: ID!, $toPluginId: ID!) {
    upgradePlugin(input: { sceneId: $sceneId, pluginId: $pluginId, toPluginId: $toPluginId }) {
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`);

export const UPLOAD_PLUGIN = gql(`
  mutation UploadPlugin($sceneId: ID!, $file: Upload, $url: URL) {
    uploadPlugin(input: { sceneId: $sceneId, file: $file, url: $url }) {
      plugin {
        id
        name
        version
        description
        author
      }
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`);

export const UNINSTALL_PLUGIN = gql(`
  mutation UninstallPlugin($sceneId: ID!, $pluginId: ID!) {
    uninstallPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      pluginId
    }
  }
`);
