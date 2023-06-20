import React, { useState } from "react";

import Box from "@reearth/classic/components/atoms/Box";
import Button from "@reearth/classic/components/atoms/Button";
import Flex from "@reearth/classic/components/atoms/Flex";
import Text from "@reearth/classic/components/atoms/Text";
import { fonts } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import DeleteModal from "./deleteModal";

export type PluginItemProps = {
  className?: string;
  thumbnail?: string;
  title?: string;
  version?: string;
  isInstalled?: boolean;
  onUninstall: () => void;
};

const PluginAccordionItemHeader: React.FC<PluginItemProps> = ({
  className,
  thumbnail,
  title,
  version,
  isInstalled,
  onUninstall,
}) => {
  const t = useT();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };
  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <Flex align="center">
        <TitleWrapper>
          {thumbnail && (
            <Box borderRadius={8} mh="m">
              <Thumbnail src={thumbnail} alt="plugin thumbnail" />
            </Box>
          )}
          <Text size="m" weight="bold" otherProperties={{ marginRight: "20px", maxWidth: "200px" }}>
            {title}
          </Text>
        </TitleWrapper>
        <Text size="m">v{version}</Text>
      </Flex>
      <StyledButton
        buttonType={isInstalled && hovered ? "danger" : "secondary"}
        type="button"
        large
        icon={isInstalled ? (hovered ? "bin" : "check") : "install"}
        text={isInstalled ? (hovered ? t("Uninstall") : t("Installed")) : t("Install")}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={isInstalled ? () => setIsModalOpen(true) : undefined}
      />
      <DeleteModal
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProceed={onUninstall}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
  padding: ${props => `${props.theme.classic.metrics.xl}px 0`};
`;

const TitleWrapper = styled(Flex)`
  width: 250px;
  margin-right: 32px;
`;

const Thumbnail = styled.img`
  border-radius: 8px;
  width: 64px;
  height: 64px;
`;

const StyledButton = styled(Button)`
  font-weight: ${fonts.weight.bold};
  width: 153px;
  border-radius: ${props => props.theme.classic.metrics.s}px;
  padding: ${({ theme }) => `${theme.classic.metrics.s}px ${theme.classic.metrics["2xl"]}`};
  transition: all 0.3s;
`;

export default PluginAccordionItemHeader;
