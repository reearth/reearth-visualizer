import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { PluginItem as PluginItemType } from "@reearth/components/molecules/Settings/Project/Plugin/PluginAccordion";

import PluginInstall from "./PluginInstall";

export type PluginItem = PluginItemType;

export type Props = {
  title?: string;
  plugins?: PluginItem[];
  loading?: boolean;
  installedPlugins?: PluginItem[];
  installFromPublicRepo: (repoUrl: string) => void;
  installByUploadingZipFile: (files: FileList) => void;
  uninstallPlugin: (pluginId: string) => void;
};

export type PluginPageMode = "list" | "install-way" | PluginInstallWay;

export type PluginInstallWay = "install-zip" | "install-public-repo" | "install-private-repo";

const PluginSection: React.FC<Props> = ({
  loading,
  installedPlugins,
  installByUploadingZipFile,
  installFromPublicRepo,
  uninstallPlugin,
}) => {
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <PluginInstall
          installedPlugins={installedPlugins}
          installFromPublicRepo={installFromPublicRepo}
          installByUploadingZipFile={installByUploadingZipFile}
          uninstallPlugin={uninstallPlugin}
        />
      )}
    </>
  );
};

export default PluginSection;
