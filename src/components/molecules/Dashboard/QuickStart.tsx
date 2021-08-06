import React, { useState } from "react";
import { useIntl } from "react-intl";
import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import Icon from "@reearth/components/atoms/Icon";
import { Asset } from "@reearth/components/molecules/Common/AssetModal/AssetContainer";
import { styled, useTheme, metrics, css } from "@reearth/theme";
import { useMedia } from "react-use";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";
import { metricsSizes } from "@reearth/theme/metrics";
export interface Props {
  className?: string;
  onCreateTeam?: (data: { name: string }) => Promise<void>;
  onCreateProject?: (data: {
    name: string;
    description: string;
    imageUrl: string;
  }) => Promise<void>;
  assets?: Asset[];
  createAssets?: (files: FileList) => Promise<void>;
}

const QuickStart: React.FC<Props> = ({
  className,
  onCreateTeam,
  onCreateProject,
  assets,
  createAssets,
}) => {
  const intl = useIntl();
  const [projCreateOpen, setProjCreateOpen] = useState(false);
  const [workCreateOpen, setWorkCreateOpen] = useState(false);

  const theme = useTheme();

  const isSmallWindow = useMedia("(max-width: 1024px)");

  return (
    <StyledDashboardBlock className={className} grow={4}>
      <Content direction="column" justify="space-around">
        <Text size={isSmallWindow ? "m" : "l"} color={theme.main.text} weight="bold">
          {intl.formatMessage({ defaultMessage: "Quick Start" })}
        </Text>
        <LongBannerButton
          align="center"
          justify="center"
          onClick={() => window.location.assign("http://docs.reearth.io")}>
          <MapIcon icon="map" />
          <Text size="m" weight="bold" customColor>
            {intl.formatMessage({ defaultMessage: "User guide" })}
          </Text>
        </LongBannerButton>
        <Flex justify="space-between">
          <HeroBannerButton
            direction="column"
            align="center"
            justify="center"
            onClick={() => setProjCreateOpen(true)}>
            <StyledIcon icon="newProject" size={70} />
            <Text size="m" weight="bold" customColor>
              {intl.formatMessage({ defaultMessage: "New project" })}
            </Text>
          </HeroBannerButton>
          <BannerButton
            direction="column"
            align="center"
            justify="center"
            onClick={() => setWorkCreateOpen(true)}>
            <StyledIcon icon="newWorkspace" size={70} />
            <Text size="m" weight="bold" customColor>
              {intl.formatMessage({ defaultMessage: "New workspace" })}
            </Text>
          </BannerButton>
        </Flex>
      </Content>
      <ProjectCreationModal
        open={projCreateOpen}
        onClose={() => setProjCreateOpen(false)}
        onSubmit={onCreateProject}
        assets={assets}
        createAssets={createAssets}
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
  background: ${({ theme }) =>
    `linear-gradient(60deg, ${theme.main.brandRed} 10%, ${theme.main.brandBlue} 50%)`};
  background-size: cover;
  background-position: top;
  color: ${({ theme }) => theme.dashboard.heroButtonTextHover};
  padding: 120px auto;
  width: 48%;
  height: 114px;

  &:hover {
    background: ${({ theme }) =>
      `linear-gradient(60deg, ${theme.main.brandRed} 30%, ${theme.main.brandBlue} 70%)`};
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
