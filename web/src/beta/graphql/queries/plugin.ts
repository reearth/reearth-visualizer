import { gql } from "@apollo/client";

export const GET_SCENE_PLUGINS_FOR_DATASET_INFO_PANE = gql`
  query GetScenePluginsForDatasetInfoPane($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      plugins {
        pluginId
        plugin {
          id
          ...PluginFragment
        }
      }
    }
  }
`;

export const GET_INSTALLED_PLUGINS = gql`
  query GetInstalledPlugins($projectId: ID!, $lang: Lang) {
    scene(projectId: $projectId) {
      id
      plugins {
        plugin {
          id
          version
          name
          description
          translatedName(lang: $lang)
          translatedDescription(lang: $lang)
          author
          repositoryUrl
        }
      }
    }
  }
`;

export const INSTALL_PLUGIN = gql`
  mutation InstallPlugin($sceneId: ID!, $pluginId: ID!) {
    installPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`;

export const UPLOAD_PLUGIN = gql`
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
`;

export const UNINSTALL_PLUGIN = gql`
  mutation UninstallPlugin($sceneId: ID!, $pluginId: ID!) {
    uninstallPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      pluginId
    }
  }
`;

export const UPGRADE_PLUGIN = gql`
  mutation UpgradePlugin($sceneId: ID!, $pluginId: ID!, $toPluginId: ID!) {
    upgradePlugin(input: { sceneId: $sceneId, pluginId: $pluginId, toPluginId: $toPluginId }) {
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`;
