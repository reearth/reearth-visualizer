import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import Icon, { Icons } from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import React from "react";
import { useIntl } from "react-intl";
import { PluginPageMode } from "..";
import PluginInstallCardButton from "./PluginInstallCardButton";

export type Props = {
  className?: string;
  onMovePrevPage?: () => void;
  onMovePage?: (mode: PluginPageMode) => void;
};

const PluginInstall: React.FC<Props> = ({ className, onMovePrevPage, onMovePage }) => {
  const intl = useIntl();
  const theme = useTheme();
  const pages: { text: string; mode: PluginPageMode; icon: Icons }[] = [
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
    {
      text: intl.formatMessage({ defaultMessage: "Private GitHub repository" }),
      mode: "install-private-repo",
      icon: "privateGitHubRepo",
    },
  ];

  return (
    <div className={className}>
      <SectionTitle>
        <StyledFlex align="center" onClick={onMovePrevPage}>
          <Icon icon="arrowLongLeft" size={20} color={theme.main.text} />
          <Box mh="m">
            <Text weight="bold" size="m">
              {intl.formatMessage({ defaultMessage: "Plugins lists" })}
            </Text>
          </Box>
        </StyledFlex>
      </SectionTitle>
      <Box p="2xl">
        <Flex gap={28}>
          {pages.map(p => {
            return (
              <PluginInstallCardButton
                key={p.mode}
                icon={p.icon}
                text={p.text}
                onClick={() => onMovePage?.(p.mode)}
              />
            );
          })}
        </Flex>
      </Box>
      <SectionTitle>
        <Box mh="m">
          <Text weight="bold" size="m">
            {intl.formatMessage({ defaultMessage: "Uploaded plugin" })}
          </Text>
        </Box>
      </SectionTitle>
    </div>
  );
};

const SectionTitle = styled.div`
  border-bottom: ${props => `solid 1px ${props.theme.main.border}`};
  padding-bottom: ${props => props.theme.metrics.xl}px;
`;

const StyledFlex = styled(Flex)`
  cursor: pointer;
`;
export default PluginInstall;
