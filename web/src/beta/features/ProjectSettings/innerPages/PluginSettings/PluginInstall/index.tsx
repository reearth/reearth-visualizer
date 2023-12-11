import React from "react";

import { Icons } from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { PluginActions } from "..";
import PluginAccordion, { PluginItem } from "../PluginAccordion";

import MarketplacePublish from "./MarketplacePublish";
import PublicRepo from "./PublicRepo";
import ZipUpload from "./ZipUpload";

export type Props = {
  installedPlugins?: PluginItem[];
  installFromPublicRepo: (repoUrl: string) => void;
  installByUploadingZipFile: (files: FileList) => void;
  uninstallPlugin: (pluginId: string) => void;
};

const PluginInstall: React.FC<Props> = ({
  installedPlugins,
  installFromPublicRepo,
  installByUploadingZipFile,
  uninstallPlugin,
}) => {
  const t = useT();

  const actionChoices: { text: string; mode: PluginActions; icon: Icons; url?: string }[] = [
    {
      text: t("Zip file from PC"),
      mode: "install-zip",
      icon: "uploadZipPlugin",
    },
    {
      text: t("Public GitHub repository"),
      mode: "install-public-repo",
      icon: "publicGitHubRepo",
    },
    {
      text: t("Publish your plugin in the Marketplace"),
      mode: "market-publish",
      icon: "marketplace",
      url: config()?.marketplaceUrl,
    },
  ];

  return (
    <>
      <ButtonsWrapper>
        {actionChoices.map(c => {
          return c.mode === "install-zip" ? (
            <ZipUpload
              key={c.mode}
              icon={c.icon}
              buttonText={c.text}
              onSend={installByUploadingZipFile}
            />
          ) : c.mode === "install-public-repo" ? (
            <PublicRepo
              key={c.mode}
              icon={c.icon}
              buttonText={c.text}
              onSend={installFromPublicRepo}
            />
          ) : c.mode === "market-publish" && c.url ? (
            <MarketplacePublish key={c.mode} icon={c.icon} buttonText={c.text} url={c.url} />
          ) : null;
        })}
      </ButtonsWrapper>

      <InstalledHeader>
        <Text size="body">{t("Installed")}</Text>
      </InstalledHeader>
      <PluginAccordion plugins={installedPlugins} uninstallPlugin={uninstallPlugin} />
    </>
  );
};

const ButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: space-between;
`;

const InstalledHeader = styled.div`
  padding: 12px;
  border-bottom: ${({ theme }) => `solid 1px ${theme.outline.weak}`};
`;

export default PluginInstall;
