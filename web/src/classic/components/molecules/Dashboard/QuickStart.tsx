import React, { useCallback, useState } from "react";
import { useMedia } from "react-use";

import DashboardBlock from "@reearth/classic/components/atoms/DashboardBlock";
import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import ProjectCreationModal from "@reearth/classic/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth/classic/components/molecules/Common/WorkspaceCreationModal";
import { metrics, metricsSizes } from "@reearth/classic/theme";
import { useMeFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme, css } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";

import ProjectTypeSelectionModal from "../Common/ProjectTypeSelectionModal";

export interface Props {
  className?: string;
  assetModal?: React.ReactNode;
  selectedAsset?: string;
  onWorkspaceCreate?: (data: { name: string }) => Promise<void>;
  onProjectCreate?: (data: {
    name: string;
    description: string;
    imageUrl: string;
    projectType: ProjectType;
  }) => Promise<void>;
  onProjectCreateClick?: () => boolean;
  onAssetSelect?: (asset?: string) => void;
  toggleAssetModal?: () => void;
}

const QuickStart: React.FC<Props> = ({
  className,
  assetModal,
  selectedAsset,
  onWorkspaceCreate,
  onProjectCreate,
  onProjectCreateClick,
  onAssetSelect,
  toggleAssetModal,
}) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const [prjCreateOpen, setPrjCreateOpen] = useState(false);
  const [prjTypeSelectOpen, setPrjTypeSelectOpen] = useState(false);
  const [workCreateOpen, setWorkCreateOpen] = useState(false);
  const [prjectType, setPrjectType] = useState<ProjectType>("classic");
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");
  const { useMeQuery } = useMeFetcher();
  const {
    me: { email = "" },
  } = useMeQuery();

  const handleCreateProjectClick = useCallback(() => {
    if (onProjectCreateClick && !onProjectCreateClick()) return;

    if (
      window.REEARTH_CONFIG?.developerMode ||
      window.REEARTH_CONFIG?.earlyAccessAdmins?.includes(email)
    )
      setPrjTypeSelectOpen(true);
    else setPrjCreateOpen(true);
  }, [email, onProjectCreateClick]);

  const handleProjModalClose = useCallback(() => {
    setPrjCreateOpen(false);
    onAssetSelect?.();
  }, [onAssetSelect]);

  const handlePrjTypeSelectModalClose = useCallback(() => {
    if (onProjectCreateClick && !onProjectCreateClick()) return;

    setPrjTypeSelectOpen(false);
    setPrjCreateOpen(true);
  }, [onProjectCreateClick]);

  const handleProjectTypeSelect = (type: ProjectType) => {
    setPrjectType(type);
    setPrjCreateOpen(true);
  };

  return (
    <StyledDashboardBlock className={className} grow={4}>
      <Content direction="column" justify="space-around">
        <Text size={isSmallWindow ? "m" : "l"} color={theme.classic.main.text} weight="bold">
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
            linearGradient={window.REEARTH_CONFIG?.brand?.background}
            onClick={handleCreateProjectClick}>
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
      <ProjectTypeSelectionModal
        open={prjTypeSelectOpen}
        onClose={handlePrjTypeSelectModalClose}
        onSubmit={handleProjectTypeSelect}
      />
      <ProjectCreationModal
        open={prjCreateOpen}
        projectType={prjectType}
        onClose={handleProjModalClose}
        onSubmit={onProjectCreate}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
        assetModal={assetModal}
      />
      <WorkspaceCreationModal
        open={workCreateOpen}
        onClose={() => setWorkCreateOpen(false)}
        onSubmit={onWorkspaceCreate}
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
  color: ${props => props.theme.classic.main.text};

  @media only screen and (max-width: 1024px) {
    height: ${metrics.dashboardContentSmallHeight}px;
    padding: ${metricsSizes.m}px;
  }
`;

const BannerButtonStyles = css`
  margin: 0px;
  border-radius: ${metricsSizes["s"]}px;
  cursor: pointer;
  transition: all 0.3s;
`;

const LongBannerButton = styled(Flex)`
  ${BannerButtonStyles};
  background: ${props => props.theme.classic.main.paleBg};
  width: 100%;
  color: ${props => props.theme.classic.main.text};
  height: 70px;

  &:hover {
    background: ${props => props.theme.classic.main.bg};
    color: ${props => props.theme.classic.main.strongText};
  }

  @media only screen and (max-width: 1024px) {
    height: 50px;
  }
`;

const BannerButton = styled(Flex)`
  ${BannerButtonStyles};
  background: ${props => props.theme.classic.main.paleBg};
  color: ${props => props.theme.classic.main.text};
  width: 48%;
  height: 114px;

  &:hover {
    background: ${props => props.theme.classic.main.bg};
    color: ${props => props.theme.classic.main.strongText};
  }

  @media only screen and (max-width: 1024px) {
    height: 60px;
  }
`;

const HeroBannerButton = styled(Flex)<{ linearGradient?: string }>`
  ${BannerButtonStyles};
  position: relative;
  z-index: ${({ theme }) => theme.classic.zIndexes.base};
  overflow: hidden;

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
    background: ${({ linearGradient, theme }) =>
      linearGradient
        ? linearGradient
        : `linear-gradient(140deg, ${theme.classic.main.brandRed} 20%, ${theme.classic.main.brandBlue} 60%)`};
    background-size: cover;
    background-position: top;
    transition: transform 0.4s;
    z-index: ${({ theme }) => theme.classic.zIndexes.hidden};
  }

  :hover {
    color: ${({ theme }) => theme.classic.dashboard.heroButtonTextHover};
  }

  &:hover:before {
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
