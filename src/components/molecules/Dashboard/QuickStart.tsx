import React, { useCallback, useState } from "react";
import { useMedia } from "react-use";

import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import { useT } from "@reearth/i18n";
import { styled, useTheme, metrics, css } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export interface Props {
  className?: string;
  onCreateTeam?: (data: { name: string }) => Promise<void>;
  onCreateProject?: (data: {
    name: string;
    description: string;
    imageUrl: string;
  }) => Promise<void>;
  assetModal?: React.ReactNode;
  toggleAssetModal?: () => void;
  selectedAsset?: string;
  onAssetSelect?: (asset?: string) => void;
}

const QuickStart: React.FC<Props> = ({
  className,
  assetModal,
  selectedAsset,
  onCreateTeam,
  onCreateProject,
  toggleAssetModal,
  onAssetSelect,
}) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const [projCreateOpen, setProjCreateOpen] = useState(false);
  const [workCreateOpen, setWorkCreateOpen] = useState(false);

  const handleProjModalClose = useCallback(() => {
    setProjCreateOpen(false);
    onAssetSelect?.();
  }, [onAssetSelect]);

  const theme = useTheme();

  const isSmallWindow = useMedia("(max-width: 1024px)");

  return (
    <StyledDashboardBlock className={className} grow={4}>
      <Content direction="column" justify="space-around">
        <Text size={isSmallWindow ? "m" : "l"} color={theme.main.text} weight="bold">
          {t("Quick Start")}
        </Text>
        {documentationUrl && (
          <LongBannerButton
            align="center"
            justify="center"
            onClick={() => window.open(documentationUrl, "_blank", "noopener")}>
            <MapIcon icon="map" />
            <Text size="m" weight="bold" customColor>
              {t("User guide")}
            </Text>
          </LongBannerButton>
        )}
        <Flex justify="space-between">
          <HeroBannerButton
            direction="column"
            align="center"
            justify="center"
            onClick={() => setProjCreateOpen(true)}>
            <StyledIcon icon="newProject" size={70} />
            <Text size="m" weight="bold" customColor>
              {t("New project")}
            </Text>
          </HeroBannerButton>
          <BannerButton
            direction="column"
            align="center"
            justify="center"
            onClick={() => setWorkCreateOpen(true)}>
            <StyledIcon icon="newWorkspace" size={70} />
            <Text size="m" weight="bold" customColor>
              {t("New workspace")}
            </Text>
          </BannerButton>
        </Flex>
      </Content>
      <ProjectCreationModal
        open={projCreateOpen}
        onClose={handleProjModalClose}
        onSubmit={onCreateProject}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
        assetModal={assetModal}
      />
      <WorkspaceCreationModal
        open={workCreateOpen}
        onClose={() => setWorkCreateOpen(false)}
        onSubmit={onCreateTeam}
      />
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled(DashboardBlock)`
  flex-grow: 4;
  @media only screen and (max-width: 1024px) {
    flex-grow: 3;
    order: 2;
  }
`;

const MapIcon = styled(Icon)`
  margin-right: ${metricsSizes["m"]}px;
`;

const Content = styled(Flex)`
  min-width: ${metrics.dashboardQuickMinWidth}px;
  height: ${metrics.dashboardContentHeight}px;
  padding: ${metricsSizes.xl}px;
  color: ${props => props.theme.main.text};

  @media only screen and (max-width: 1024px) {
    height: ${metrics.dashboardContentSmallHeight}px;
    padding: ${metricsSizes.m}px;
  }
`;

const BannerButtonStyles = css`
  margin: 0px;
  border-radius: ${metricsSizes["s"]}px;
  cursor: pointer;
`;

const LongBannerButton = styled(Flex)`
  ${BannerButtonStyles};
  background: ${props => props.theme.main.paleBg};
  width: 100%;
  color: ${props => props.theme.main.text};
  height: 70px;

  &:hover {
    background: ${props => props.theme.main.bg};
    color: ${props => props.theme.main.strongText};
  }

  @media only screen and (max-width: 1024px) {
    height: 50px;
  }
`;

const BannerButton = styled(Flex)`
  ${BannerButtonStyles};
  background: ${props => props.theme.main.paleBg};
  color: ${props => props.theme.main.text};
  width: 48%;
  height: 114px;

  &:hover {
    background: ${props => props.theme.main.bg};
    color: ${props => props.theme.main.strongText};
  }

  @media only screen and (max-width: 1024px) {
    height: 60px;
  }
`;

const HeroBannerButton = styled(Flex)`
  ${BannerButtonStyles};
  position: relative;
  z-index: ${({ theme }) => theme.zIndexes.base};
  overflow: hidden;

  color: ${({ theme }) => theme.dashboard.heroButtonTextHover};
  padding: 120px auto;
  width: 48%;
  height: 114px;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    background: ${({ theme }) =>
      `linear-gradient(140deg, ${theme.main.brandRed} 20%, ${theme.main.brandBlue} 60%)`};
    background-size: cover;
    background-position: top;
    transition: transform 0.4s;
    z-index: ${({ theme }) => theme.zIndexes.hidden};
  }

  &:hover: :before {
    transform: translateY(-50%);
  }
  @media only screen and (max-width: 1024px) {
    height: 60px;
  }
`;

const StyledIcon = styled(Icon)`
  margin-top: -10px;

  @media only screen and (max-width: 1024px) {
    display: none;
  }
`;

export default QuickStart;
