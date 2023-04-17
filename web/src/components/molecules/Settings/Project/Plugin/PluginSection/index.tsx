import React, { useMemo } from "react";

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
  marketplacePlugins?:
    | {
        fullId: string;
        id: string;
        version: string;
        title?: string;
        author?: string;
      }[]
    | undefined;
  personalPlugins?: PluginItem[];
  extensions?: {
    library: Extension<"plugin-library">[] | undefined;
    installed: Extension<"plugin-installed">[] | undefined;
  };
  currentTheme?: "light" | "dark";
  currentLang?: string;
  accessToken?: string;
  onInstallFromMarketplace: (pluginId: string | undefined, oldPluginId?: string) => void;
  onInstallFromPublicRepo: (repoUrl: string) => void;
  onInstallFromFile: (files: FileList) => void;
  onUninstall: (pluginId: string) => void;
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
  marketplacePlugins,
  personalPlugins,
  extensions,
  currentTheme,
  currentLang,
  accessToken,
  onInstallFromMarketplace,
  onInstallFromFile,
  onInstallFromPublicRepo,
  onUninstall,
}) => {
  const t = useT();

  const tabHeaders = useMemo(
    () => ({
      Marketplace: t("Plugin Marketplace"),
      Public: t("Public Installed"),
      Personal: t("Personal Installed"),
    }),
    [t],
  );

  return (
    <TabSection<PluginTabs> selected="Marketplace" menuAlignment="top" headers={tabHeaders}>
      {{
        Marketplace: (
          <Box pv="2xl">
            {accessToken &&
              extensions?.library?.map(ext => (
                <ext.component
                  key={ext.id}
                  theme={currentTheme}
                  lang={currentLang}
                  installedPlugins={marketplacePlugins}
                  accessToken={accessToken}
                  onInstall={onInstallFromMarketplace}
                  onUninstall={onUninstall}
                />
              ))}
          </Box>
        ),
        Public: (
          <Box>
            {accessToken &&
              extensions?.installed?.map(ext => (
                <ext.component
                  key={ext.id}
                  installedPlugins={marketplacePlugins}
                  theme={currentTheme}
                  lang={currentLang}
                  accessToken={accessToken}
                  onInstall={onInstallFromMarketplace}
                  onUninstall={onUninstall}
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
            installByUploadingZipFile={onInstallFromFile}
            uninstallPlugin={onUninstall}
          />
        ),
      }}
    </TabSection>
  );
};

export default PluginSection;
