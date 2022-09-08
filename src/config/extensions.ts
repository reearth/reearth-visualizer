export type ExtensionType =
  | "dataset-import"
  | "publication"
  | "plugin-library"
  | "plugin-installed"
  | "global-modal";

export type SharedExtensionProps = {
  theme?: string;
  lang?: string;
  accessToken?: string;
  onNotificationChange?: (
    type: "error" | "warning" | "info" | "success",
    text: string,
    heading?: string,
  ) => void;
};

export type DatasetImportExtensionProps = {
  onReturn?: () => void;
  onUrlChange?: (url: string) => void;
  url?: string;
} & SharedExtensionProps;

export type ProjectPublicationExtensionProps = {
  projectId: string;
  projectAlias?: string;
  publishDisabled?: boolean;
} & SharedExtensionProps;

export type PluginExtensionProps = {
  selectedPluginId?: string;
  installedPlugins?: {
    id: string;
    version: string;
  }[];
  onInstall?: (pluginId: string) => void;
  onUninstall?: (pluginId: string) => void;
} & SharedExtensionProps;

export type GlobalModalProps = {
  show?: boolean;
  onLogOut?: () => void;
} & SharedExtensionProps;

export type ExtensionProps = {
  "dataset-import": DatasetImportExtensionProps;
  publication: ProjectPublicationExtensionProps;
  "plugin-library": PluginExtensionProps;
  "plugin-installed": PluginExtensionProps;
  "global-modal": GlobalModalProps;
};

export type Extension<T extends ExtensionType = ExtensionType> = {
  type: T;
  id: string;
  component: React.ComponentType<ExtensionProps[T]>;
  title?: string;
  image?: string;
};

export type Extensions = {
  publication?: Extension<"publication">[];
  datasetImport?: Extension<"dataset-import">[];
  pluginLibrary?: Extension<"plugin-library">[];
  pluginInstalled?: Extension<"plugin-installed">[];
  globalModal?: Extension<"global-modal">[];
};

export async function loadExtensions(urls?: string[]): Promise<Extensions | undefined> {
  if (!urls) return undefined;

  // Entry point for publication extensions is @reearth/components/molecules/Settings/Project/PublishSection/hooks.ts
  const publication: Extension<"publication">[] = [];
  // Entry point for dataset import extensions is @reearth/components/molecules/EarthEditor/DatasetPane/DatasetModal/hooks.ts
  const datasetImport: Extension<"dataset-import">[] = [];
  // Entry point for plugin library extensions is @reearth/components/molecules/Settings/Project/Plugin/PluginSection/PluginInstall/hooks.ts
  const pluginLibrary: Extension<"plugin-library">[] = [];
  // Entry point for plugin installed extensions is @reearth/components/molecules/Settings/Project/Plugin/PluginSection/PluginInstall/hooks.ts
  const pluginInstalled: Extension<"plugin-installed">[] = [];
  // Entry point for globalModal extensions is @reearth/components/organisms/GlobalModal/hooks.ts
  const globalModal: Extension<"global-modal">[] = [];

  for (const url of urls) {
    try {
      const newExtensions: Extension[] = (await import(/* @vite-ignore */ url)).default;
      newExtensions.forEach(ext => {
        if (ext.type === "dataset-import") datasetImport.push(ext as Extension<"dataset-import">);
        else if (ext.type === "publication") publication.push(ext as Extension<"publication">);
        else if (ext.type === "plugin-library")
          pluginLibrary.push(ext as Extension<"plugin-library">);
        else if (ext.type === "plugin-installed")
          pluginInstalled.push(ext as Extension<"plugin-installed">);
        else if (ext.type === "global-modal") globalModal.push(ext as Extension<"global-modal">);
      });
    } catch (e) {
      console.error("extension load failed", e);
    }
  }

  return {
    publication,
    datasetImport,
    pluginLibrary,
    pluginInstalled,
    globalModal,
  };
}
