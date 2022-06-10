import React from "react";

import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Icon from "@reearth/components/atoms/Icon";
import Project from "@reearth/components/molecules/Dashboard/Project";
import { Project as ProjectType } from "@reearth/components/molecules/Dashboard/types";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
  projects?: ProjectType[];
}

const ProjectList: React.FC<Props> = ({ className, projects }) => {
  const t = useT();
  return (
    <StyledDashboardBlock className={className}>
      {projects?.length ? (
        <Content>
          {projects
            .filter(project => !project.isArchived)
            .map(project => (
              <Project key={project.id} project={project} />
            ))}
        </Content>
      ) : (
        <Template>
          <Icon icon="noProjects" />
          <Text>
            {t(
              "You have no projects in your workspace. Click the button above in the Quick Start to create a project now!",
            )}
          </Text>
        </Template>
      )}
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled(DashboardBlock)`
  width: 100%;
  @media only screen and (max-width: 1024px) {
    order: 4;
  }
`;

const Content = styled.div`
  min-height: 50vh;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;
  color: ${props => props.theme.main.text};

  &::after {
    content: "";
    flex: 0 33%;
  }

  @media only screen and (max-width: 1024px) {
    order: 3;
    min-height: 40vh;

    &::after {
      content: "";
      flex: 50%;
    }
  }
`;

const Template = styled.div`
  height: 55vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  color: ${props => props.theme.main.weak};
`;

const Text = styled.p`
  padding-top: 10px;
`;

export default ProjectList;
