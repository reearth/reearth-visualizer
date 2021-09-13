import React from "react";
import { useIntl } from "react-intl";

import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { Icons } from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";

import { PluginInstallWay } from "..";
import PluginAccordion, { PluginItem } from "../../PluginAccordion";

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
  const intl = useIntl();
  const installChoices: { text: string; mode: PluginInstallWay; icon: Icons }[] = [
    {
      text: intl.formatMessage({ defaultMessage: "Zip file from PC" }),
      mode: "install-zip",
      icon: "uploadZipPlugin",
    },
    {
      text: intl.formatMessage({ defaultMessage: "Public GitHub repository" }),
      mode: "install-public-repo",
      icon: "publicGitHubRepo",
    },
    // {
    //   text: intl.formatMessage({ defaultMessage: "Private GitHub repository" }),
    //   mode: "install-private-repo",
    //   icon: "privateGitHubRepo",
    // },
  ];

  return (
    <>
      <Box p="2xl">
        <Flex gap={28}>
          {installChoices.map(c => {
            return c.mode === "install-public-repo" ? (
              <PublicRepo icon={c.icon} buttonText={c.text} onSend={installFromPublicRepo} />
            ) : c.mode === "install-zip" ? (
              <ZipUpload icon={c.icon} buttonText={c.text} onSend={installByUploadingZipFile} />
            ) : null;
          })}
        </Flex>
      </Box>
      <SectionTitle>
        <Box mh="m">
          <Text weight="bold" size="m">
            {intl.formatMessage({ defaultMessage: "Installed plugins" })}
          </Text>
        </Box>
      </SectionTitle>
      <PluginAccordion items={installedPlugins} uninstallPlugin={uninstallPlugin} />
    </>
  );
};

const SectionTitle = styled.div`
  border-bottom: ${props => `solid 1px ${props.theme.main.border}`};
  padding-bottom: ${props => props.theme.metrics.xl}px;
`;

export default PluginInstall;
