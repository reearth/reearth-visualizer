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

export const GET_INSTALLABLE_PLUGINS = gql`
  query GetInstallablePlugins {
    installablePlugins {
      name
      description
      thumbnailUrl
      author
      createdAt
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
