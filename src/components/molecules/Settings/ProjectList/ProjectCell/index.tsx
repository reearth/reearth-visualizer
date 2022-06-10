import React, { useState } from "react";

// Components
import PublicationStatus, {
  Status as StatusType,
} from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import defaultProjectImage from "./defaultProjectImage.jpg";

export type Status = StatusType;

export type Project = {
  id: string;
  name: string;
  imageUrl?: string;
  status: Status;
  isArchived?: boolean;
  description: string;
  sceneId?: string;
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
        <Title size="l" color={theme.projectCell.title}>
          {project.name ? project.name : t("No Title Project")}
        </Title>
        {isHover && (
          <DescriptionWrapper>
            <Desc size="s" color={theme.projectCell.description} isParagraph={true}>
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
    props.project.imageUrl ? `url(${props.project.imageUrl})` : `url(${defaultProjectImage})`};
  background-size: ${props => (props.project.imageUrl ? "cover" : "400px 240px")};
  background-position: center;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  height: 240px;
`;

const Wrapper = styled.div<{ isHover?: boolean }>`
  box-sizing: border-box;
  padding: ${metricsSizes["2xl"]}px ${metricsSizes["l"]}px;
  cursor: pointer;
  height: 100%;
  background-color: ${props => (props.isHover ? props.theme.main.lightTransparentBg : "")};
  border: 1px solid
    ${props => (props.isHover ? props.theme.main.select : props.theme.main.lightTransparentBg)};
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
  color: ${props => props.theme.projectCell.description};
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
  background: ${props => props.theme.notification.infoBg};
  border-radius: 50px;
  margin: auto ${metricsSizes["s"]}px auto 0;
`;

export default ProjectCell;
