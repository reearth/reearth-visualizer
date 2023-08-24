import { useMemo, useState } from "react";

import Text from "@reearth/beta/components/Text";
import { Extension } from "@reearth/services/config/extensions";
import { useT, useLang } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { InnerPage, ArchivedSettingNotice } from "../common";

import PluginInstall from "./PluginInstall";

export type PluginTabs = "Marketplace" | "Public" | "Personal";

export type PluginActions =
  | "install-zip"
  | "install-public-repo"
  | "install-private-repo"
  | "market-publish";

type Props = {
  isArchived: boolean;
  accessToken?: string;
  extensions?: {
    library: Extension<"plugin-library">[] | undefined;
    installed: Extension<"plugin-installed">[] | undefined;
  };
};

const PluginSettings: React.FC<Props> = ({ isArchived, accessToken, extensions }) => {
  const t = useT();
  const currentLang = useLang();

  const tabs: { id: PluginTabs; label: string }[] = useMemo(
    () => [
      { id: "Marketplace", label: t("Plugin Marketplace") },
      { id: "Public", label: t("Public Installed") },
      { id: "Personal", label: t("Personal Installed") },
    ],
    [t],
  );

  const [currentTab, setCurrentTab] = useState<PluginTabs>("Marketplace");

  return (
    <InnerPage wide transparent>
      {!isArchived ? (
        <Wrapper>
          <Tabs>
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                size="body"
                active={tab.id === currentTab}
                onClick={() => {
                  setCurrentTab(tab.id);
                }}>
                {tab.label}
              </Tab>
            ))}
          </Tabs>

          {currentTab === "Marketplace" && (
            <>
              {accessToken &&
                extensions?.library?.map(ext => (
                  <ext.component
                    key={ext.id}
                    // TODO: useTheme when we have light/dark for beta
                    theme={"dark"}
                    lang={currentLang}
                    accessToken={accessToken}
                    // TODO: Connet
                    // installedPlugins={marketplacePlugins}
                    // onInstall={onInstallFromMarketplace}
                    // onUninstall={onUninstall}
                  />
                ))}
            </>
          )}

          {currentTab === "Public" && (
            <>
              {accessToken &&
                extensions?.installed?.map(ext => (
                  <ext.component
                    key={ext.id}
                    // TODO: useTheme when we have light/dark for beta
                    theme={"dark"}
                    lang={currentLang}
                    accessToken={accessToken}
                    // TODO: Connet
                    // installedPlugins={marketplacePlugins}
                    // onInstall={onInstallFromMarketplace}
                    // onUninstall={onUninstall}
                  />
                ))}
            </>
          )}

          {currentTab === "Personal" && (
            <PluginInstall
              // TODO: Connet
              // installedPlugins={personalPlugins}
              // installFromPublicRepo={onInstallFromPublicRepo}
              // installByUploadingZipFile={onInstallFromFile}
              // uninstallPlugin={onUninstall}
              installedPlugins={[]}
              installFromPublicRepo={() => {}}
              installByUploadingZipFile={() => {}}
              uninstallPlugin={() => {}}
            />
          )}
        </Wrapper>
      ) : (
        <ArchivedSettingNotice />
      )}
    </InnerPage>
  );
};

export default PluginSettings;

const Wrapper = styled.div`
  width: 100%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
`;

const Tab = styled(Text)<{ active?: boolean }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ active, theme }) => (active ? theme.bg[2] : "transparent")};
  color: ${({ active, theme }) => (active ? theme.content.main : theme.bg[2])};
`;
