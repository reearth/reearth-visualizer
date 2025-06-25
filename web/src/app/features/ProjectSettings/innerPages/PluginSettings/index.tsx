import { TabItem, Tabs } from "@reearth/app/lib/reearth-ui";
import { Extension } from "@reearth/services/config/extensions";
import { ScenePlugin } from "@reearth/services/gql";
import { useT, useLang } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useMemo } from "react";

import { InnerPage, ArchivedSettingNotice } from "../common";

import useHooks from "./hooks";
import PluginInstall from "./PluginInstall";

export type PluginTabs = "Marketplace" | "Public" | "Personal";

type Props = {
  sceneId?: string;
  isArchived: boolean;
  accessToken?: string;
  plugins?: ScenePlugin[];
  extensions?: {
    library: Extension<"plugin-library">[] | undefined;
    installed: Extension<"plugin-installed">[] | undefined;
  };
};

const PluginSettings: React.FC<Props> = ({
  sceneId,
  isArchived,
  accessToken,
  plugins,
  extensions
}) => {
  const t = useT();
  const currentLang = useLang();

  const {
    personalPlugins,
    marketplacePlugins,
    handleInstallPluginByMarketplace,
    handleInstallPluginFromPublicRepo,
    handleInstallPluginFromFile,
    handleUninstallPlugin
  } = useHooks({ sceneId, plugins });

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        id: "Marketplace",
        name: t("Plugin Marketplace"),
        children: (
          <>
            {accessToken &&
              extensions?.library?.map((ext) => (
                <ext.component
                  key={ext.id}
                  theme={"dark"}
                  version={"visualizer"}
                  lang={currentLang}
                  accessToken={accessToken}
                  installedPlugins={marketplacePlugins}
                  onInstall={handleInstallPluginByMarketplace}
                  onUninstall={handleUninstallPlugin}
                />
              ))}
          </>
        )
      },
      {
        id: "Public",
        name: t("Public Installed"),
        children: (
          <>
            {accessToken &&
              extensions?.installed?.map((ext) => (
                <ext.component
                  key={ext.id}
                  theme={"dark"}
                  lang={currentLang}
                  accessToken={accessToken}
                  installedPlugins={marketplacePlugins}
                  onInstall={handleInstallPluginByMarketplace}
                  onUninstall={handleUninstallPlugin}
                />
              ))}
          </>
        )
      },
      {
        id: "Personal",
        name: t("Personal Installed"),
        children: (
          <PluginInstall
            installedPlugins={personalPlugins}
            installFromPublicRepo={handleInstallPluginFromPublicRepo}
            installByUploadingZipFile={handleInstallPluginFromFile}
            uninstallPlugin={handleUninstallPlugin}
          />
        )
      }
    ],
    [
      accessToken,
      extensions,
      currentLang,
      marketplacePlugins,
      personalPlugins,
      t,
      handleInstallPluginByMarketplace,
      handleInstallPluginFromPublicRepo,
      handleInstallPluginFromFile,
      handleUninstallPlugin
    ]
  );

  return (
    <InnerPage wide transparent>
      {!isArchived ? (
        <Wrapper>
          <Tabs tabStyle="separated" tabs={tabItems} background="transparent" />
        </Wrapper>
      ) : (
        <ArchivedSettingNotice />
      )}
    </InnerPage>
  );
};

export default PluginSettings;

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  padding: `${theme.spacing.largest}px 0`
}));
