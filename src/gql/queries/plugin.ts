import { gql } from "@apollo/client";

// import { layerFragment } from "@reearth/gql/fragments";

export const GET_INSTALLED_PLUGINS = gql`
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

export const INSTALLABLE_PLUGINS = gql`
  query InstallablePlugins {
    installablePlugins {
      name
      description
      thumbnailUrl
      author
      createdAt
    }
  }
`;

export const INSTALLED_PLUGINS = gql`
  query InstalledPlugins($projectId: ID!, $lang: Lang) {
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
  mutation uninstallPlugin($sceneId: ID!, $pluginId: ID!) {
    uninstallPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      pluginId
    }
  }
`;
