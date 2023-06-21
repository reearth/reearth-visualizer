import React, { useState } from "react";

// Components
import defaultBetaProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultBetaProjectImage.png";
import defaultProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultProjectImage.jpg";
import PublicationStatus, {
  Status as StatusType,
} from "@reearth/classic/components/atoms/PublicationStatus";
import Text from "@reearth/classic/components/atoms/Text";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";

export type Status = StatusType;

export type Project = {
  id: string;
  name: string;
  imageUrl?: string;
  status: Status;
  isArchived?: boolean;
  description: string;
  sceneId?: string;
  projectType?: ProjectType;
};

export type Props = {
  project: Project;
  onSelect?: (p: Project) => void;
};

const ProjectCell: React.FC<Props> = ({ project, onSelect }) => {
  const t = useT();
  const theme = useTheme();
  const [isHover, setHover] = useState(false);

  return (
    <StyledWrapper project={project}>
      <Wrapper
        onClick={() => onSelect?.(project)}
        isHover={isHover}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <Title size="l" color={theme.classic.projectCell.title}>
          {project.name ? project.name : t("No Title Project")}
        </Title>
        {isHover && (
          <DescriptionWrapper>
            <Desc size="s" color={theme.classic.projectCell.description} isParagraph={true}>
              {project.description ? project.description : t("No Description...")}
            </Desc>
          </DescriptionWrapper>
        )}
        <StatusWrapper>
          <Public status={project.status} size={"md"} />
          {project.isArchived && (
            <ArchiveStatus>
              <StatusCircle />
              <Text size={"m"}>Archived</Text>
            </ArchiveStatus>
          )}
        </StatusWrapper>
      </Wrapper>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ project: Project }>`
  background: ${props =>
    props.project.imageUrl
      ? `url(${props.project.imageUrl})`
      : props.project.projectType === "beta"
      ? `url(${defaultBetaProjectImage})`
      : `url(${defaultProjectImage})`};
  background-size: ${props => (props.project.imageUrl ? "cover" : "400px 240px")};
  background-position: center;
  box-shadow: 0 0 5px ${props => props.theme.classic.projectCell.shadow};
  height: 240px;
`;

const Wrapper = styled.div<{ isHover?: boolean }>`
  box-sizing: border-box;
  padding: ${metricsSizes["2xl"]}px ${metricsSizes["l"]}px;
  cursor: pointer;
  height: 100%;
  background-color: ${props => (props.isHover ? props.theme.classic.main.lightTransparentBg : "")};
  border: 1px solid
    ${props =>
      props.isHover
        ? props.theme.classic.main.select
        : props.theme.classic.main.lightTransparentBg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled(Text)`
  text-align: left;
  user-select: none;
`;

const DescriptionWrapper = styled.div`
  margin-top: ${metricsSizes["2xl"]}px;
  flex: 1;
  width: 90%;
`;

const Desc = styled(Text)`
  text-align: left;
  user-select: none;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  display: -webkit-inline-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin: 8px;
`;

const Public = styled(PublicationStatus)`
  color: ${props => props.theme.classic.projectCell.description};
  margin: 8px;
`;

const ArchiveStatus = styled.div`
  display: flex;
  align-items: center;
  margin: auto ${metricsSizes["s"]}px auto ${metricsSizes["s"]}px;
`;

const StatusCircle = styled.div`
  width: 9px;
  height: 9px;
  background: ${props => props.theme.classic.notification.infoBg};
  border-radius: 50px;
  margin: auto ${metricsSizes["s"]}px auto 0;
`;

export default ProjectCell;
