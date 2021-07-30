import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { styled, useTheme } from "@reearth/theme";
import ProjectCell, {
  Project as ProjectType,
} from "@reearth/components/molecules/Settings/ProjectList/ProjectCell";
import Icon from "@reearth/components/atoms/Icon";
import Button from "@reearth/components/atoms/Button";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";
import { metricsSizes } from "@reearth/theme/metrics";

export type Project = ProjectType;

export type Props = {
  title?: string;
  archived?: boolean;
  projects?: Project[];
  loading?: boolean;
  onProjectSelect?: (project: Project) => void;
  onCreationButtonClick?: () => void;
};

const ProjectList: React.FC<Props> = ({
  loading,
  projects,
  title,
  archived,
  onProjectSelect,
  onCreationButtonClick,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (archived) {
      setOpen(false);
    }
  }, [archived]);
  const theme = useTheme();

  return (
    <>
      {archived && (
        <StyledFlex align="center" onClick={() => setOpen(!open)}>
          <StyledIcon icon="arrowToggle" size={15} color={theme.main.text} />
          <Text
            size="m"
            weight="normal"
            color={theme.main.text}
            otherProperties={{ margin: "12px 0" }}>
            {`${intl.formatMessage({ defaultMessage: "Archived Projects" })} (${
              projects?.length || 0
            })`}
          </Text>
        </StyledFlex>
      )}
      {!archived && (
        <StyledFlex justify="space-between" align="center">
          <Text size="m" weight="normal" color={theme.main.text}>
            {title ||
              `${intl.formatMessage({ defaultMessage: "Current Projects" })} (${
                projects?.length || 0
              })`}
          </Text>
          <Button
            large
            buttonType="secondary"
            text={intl.formatMessage({ defaultMessage: "New Project" })}
            onClick={onCreationButtonClick}
          />
        </StyledFlex>
      )}
      {loading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
          {open && (
            <ProjectListContainner>
              {projects?.map(project => (
                <ProjectCell project={project} key={project.id} onSelect={onProjectSelect} />
              ))}
            </ProjectListContainner>
          )}
        </>
      )}
    </>
  );
};

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`;

const ProjectListContainner = styled.div`
  > * {
    margin-bottom: ${metricsSizes["4xl"]}px;
  }
`;

const StyledFlex = styled(Flex)`
  border-bottom: solid 1px ${({ theme }) => theme.projectCell.divider};
  cursor: pointer;
`;

export default ProjectList;
