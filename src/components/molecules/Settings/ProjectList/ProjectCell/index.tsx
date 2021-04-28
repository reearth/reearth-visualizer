import React from "react";
import { useIntl } from "react-intl";

// Components
import PublicationStatus, {
  Status as StatusType,
} from "@reearth/components/atoms/PublicationStatus";

import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

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
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Wrapper project={project} onClick={() => onSelect?.(project)}>
      <Title size="xl" color={theme.projectCell.text}>
        {project.name ? project.name : intl.formatMessage({ defaultMessage: "No Title Project" })}
      </Title>
      <Desc size="s" color={theme.projectCell.text}>
        {project.description
          ? project.description
          : intl.formatMessage({ defaultMessage: "No Description..." })}
      </Desc>
      <PublicationStatus status={project.status} />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ project: Project }>`
  background: ${props =>
    props.project.imageUrl ? `url(${props.project.imageUrl})` : props.theme.colors.bg[4]};
  background-size: cover;
  color: ${props => props.theme.projectCell.text};
  padding: 10px;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  margin: 10px 0;
  padding: 28px;
  // position: relative;
  width: 100%;
  height: 223px;
  cursor: pointer;
`;

const Title = styled(Text)`
  text-align: left;
  margin-bottom: 130px;
  user-select: none;
`;

const Desc = styled(Text)`
  text-align: left;
  user-select: none;
  margin-bottom: 35px;
`;

export default ProjectCell;
