import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import React from "react";

import PluginList, { PluginItem } from "./PluginList";
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
  uninstallPlugin
}) => {
  const t = useT();

  return (
    <Wrapper>
      <ButtonsWrapper>
        <ZipUpload
          key="install-zip"
          icon="uploadZipPlugin"
          buttonText={t("Zip file from PC")}
          onSend={installByUploadingZipFile}
        />
        <PublicRepo
          key="install-public-repo"
          icon="publicGitHubRepo"
          buttonText={t("Public GitHub repository")}
          onSend={installFromPublicRepo}
        />
      </ButtonsWrapper>
      <PluginList
        plugins={installedPlugins}
        uninstallPlugin={uninstallPlugin}
      />
    </Wrapper>
  );
};

export default PluginInstall;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.super
}));

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.largest,
  justifyContent: css.justifyContent.spaceBetween
}));
