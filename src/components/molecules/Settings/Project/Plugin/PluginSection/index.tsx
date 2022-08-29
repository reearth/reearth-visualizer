import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

import Box from "@reearth/components/atoms/Box";
import Loading from "@reearth/components/atoms/Loading";
import TabSection from "@reearth/components/atoms/TabSection";
import { PluginItem as PluginItemType } from "@reearth/components/molecules/Settings/Project/Plugin/PluginAccordion";
import { Extension } from "@reearth/config/extensions";
import { useT } from "@reearth/i18n";

import PluginInstall from "./PluginInstall";

export type PluginItem = PluginItemType;

export type Props = {
  title?: string;
  loading?: boolean;
  marketplacePluginIds?:
    | {
        id: string;
        version: string;
      }[]
    | undefined;
  personalPlugins?: PluginItem[];
  extensions?: {
    library: Extension<"plugin-library">[] | undefined;
    installed: Extension<"plugin-installed">[] | undefined;
  };
  accessToken?: string;
  onInstallByMarketplace: (pluginId: string) => void;
  onInstallFromPublicRepo: (repoUrl: string) => void;
  onInstallByUploadingZipFile: (files: FileList) => void;
  uninstallPlugin: (pluginId: string) => void;
};

export type PluginPageMode = "list" | "install-way" | PluginActions;

export type PluginActions =
  | "install-zip"
  | "install-public-repo"
  | "install-private-repo"
  | "market-publish";

export type PluginTabs = "Marketplace" | "Public" | "Personal";

const PluginSection: React.FC<Props> = ({
  loading,
  marketplacePluginIds,
  personalPlugins,
  extensions,
  accessToken,
  onInstallByMarketplace,
  onInstallByUploadingZipFile,
  onInstallFromPublicRepo,
  uninstallPlugin,
}) => {
  const t = useT();
  const { search } = useLocation();
  const queriedPluginId = useMemo(
    () => new URLSearchParams(search).get("pluginId") ?? undefined,
    [search],
  );

  const tabHeaders = useMemo(
    () => ({
      Marketplace: t("Plugin Marketplace"),
      Public: t("Public Installed"),
      Personal: t("Personal Installed"),
    }),
    [t],
  );

  return (
    <>
      <TabSection<PluginTabs> selected="Marketplace" menuAlignment="top" headers={tabHeaders}>
        {{
          Marketplace: (
            <Box p="2xl">
              {accessToken &&
                extensions?.library?.map(ext => (
                  <ext.component
                    key={ext.id}
                    selectedPluginId={queriedPluginId}
                    accessToken={accessToken}
                    onInstall={onInstallByMarketplace}
                    onUninstall={uninstallPlugin}
                  />
                ))}
            </Box>
          ),
          Public: (
            <Box p="2xl">
              {accessToken &&
                extensions?.installed?.map(ext => (
                  <ext.component
                    key={ext.id}
                    installedPlugins={marketplacePluginIds}
                    accessToken={accessToken}
                    onInstall={onInstallByMarketplace}
                    onUninstall={uninstallPlugin}
                  />
                ))}
            </Box>
          ),
          Personal: loading ? (
            <Loading />
          ) : (
            <PluginInstall
              installedPlugins={personalPlugins}
              installFromPublicRepo={onInstallFromPublicRepo}
              installByUploadingZipFile={onInstallByUploadingZipFile}
              uninstallPlugin={uninstallPlugin}
            />
          ),
        }}
      </TabSection>
    </>
  );
};

export default PluginSection;
