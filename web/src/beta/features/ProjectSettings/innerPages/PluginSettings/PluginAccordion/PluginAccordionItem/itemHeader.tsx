import React, { useState } from "react";

import Button from "@reearth/beta/components/Button";
import Flex from "@reearth/beta/components/Flex";
import Text from "@reearth/beta/components/Text";
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

  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <InfoWrapper>
        <TitleWrapper>
          {thumbnail && (
            <ThumbnailWrapper>
              <Thumbnail src={thumbnail} alt="plugin thumbnail" />
            </ThumbnailWrapper>
          )}
          <Text
            size="body"
            weight="bold"
            otherProperties={{ marginRight: "20px", maxWidth: "200px" }}>
            {title}
          </Text>
        </TitleWrapper>
        <Text size="body">v{version}</Text>
      </InfoWrapper>
      <StyledButton
        buttonType={isInstalled && hovered ? "danger" : "secondary"}
        icon={isInstalled ? (hovered ? "bin" : "checkmark") : "install"}
        text={isInstalled ? (hovered ? t("Uninstall") : t("Installed")) : t("Install")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        margin="0"
        onClick={
          isInstalled
            ? e => {
                setIsModalOpen(true);
                e.stopPropagation();
              }
            : undefined
        }
      />
      <DeleteModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onProceed={() => {
          onUninstall();
          setIsModalOpen(false);
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
`;

const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TitleWrapper = styled(Flex)`
  width: 250px;
  margin-right: 32px;
`;

const ThumbnailWrapper = styled.div`
  border-radius: 8px;
  margin: ${({ theme }) => theme.metrics.m};
`;

const Thumbnail = styled.img`
  border-radius: 8px;
  width: 64px;
  height: 64px;
`;

const StyledButton = styled(Button)`
  width: 153px;
`;

export default PluginAccordionItemHeader;
