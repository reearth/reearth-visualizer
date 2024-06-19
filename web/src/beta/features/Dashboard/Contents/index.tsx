import { FC } from "react";

import { styled } from "@reearth/services/theme";

import { DashboardProps } from "..";

import useHooks from "./hooks";
import { Projects } from "./Projects";

const DashboardContents: FC<DashboardProps> = ({ tab, workspaceId }) => {
  const {
    projects,
    projectLoading,
    hasMoreProjects,
    handleGetMoreProjects,
    handleUpdateProject,
    handleOnClickProject,
    handleCreateProject,
  } = useHooks(workspaceId);

  return (
    <Wrapper>
      {tab === "project" && (
        <Projects
          projects={projects}
          isLoading={projectLoading}
          hasMoreProjects={hasMoreProjects}
          onGetMoreProjects={handleGetMoreProjects}
          onUpdateProject={handleUpdateProject}
          onClickProject={handleOnClickProject}
          onCreateProject={handleCreateProject}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.largest}px ${theme.spacing.largest}px 0 ${theme.spacing.largest}px`,
  flex: 1,
}));

export default DashboardContents;
