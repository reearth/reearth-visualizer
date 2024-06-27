import { FC } from "react";

import { Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import CommonHeader from "../CommonHeader";

import useHooks from "./hooks";
import ProjectGridViewItem from "./Project/ProjectGridViewItem";
import ProjectListViewItem from "./Project/ProjectListViewItem";
import ProjectCreatorModal from "./ProjectCreatorModal";

const options = [{ value: "date", label: "Latest modified" }];

const Projects: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    projects,
    isLoading,
    hasMoreProjects,
    selectedProject,
    projectCreatorVisible,
    isStarred,
    wrapperRef,
    viewState,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleProjectStarClick,
    handleScrollToBottom,
    handleViewStateChange,
  } = useHooks(workspaceId);

  const theme = useTheme();
  const t = useT();

  return (
    <Wrapper onClick={() => handleProjectSelect(undefined)}>
      <CommonHeader
        viewState={viewState || ""}
        title={t("New Project")}
        appearance="primary"
        icon="plus"
        options={options}
        onChangeView={handleViewStateChange}
        onClick={showProjectCreator}
      />
      <ProjectsWrapper
        ref={wrapperRef}
        onScroll={e => {
          !isLoading && hasMoreProjects && handleScrollToBottom(e, handleGetMoreProjects);
        }}>
        {viewState === "grid" && (
          <ProjectsGrid>
            {projects.map(project => (
              <ProjectGridViewItem
                key={project.id}
                project={project}
                isStarred={isStarred[project.id] || false}
                selectedProjectId={selectedProject?.id}
                onProjectStarClick={handleProjectStarClick}
                onProjectUpdate={handleProjectUpdate}
                onProjectSelect={handleProjectSelect}
                onProjectOpen={() => handleProjectOpen(project.sceneId)}
              />
            ))}
          </ProjectsGrid>
        )}
        {viewState === "list" && (
          <FlexTable>
            <FlexTableRow>
              <ActionCell />
              <ProjectNameCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Project Name")}
                </Typography>
              </ProjectNameCell>
              <TimeCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Last modified")}
                </Typography>
              </TimeCell>
              <TimeCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Created time")}
                </Typography>
              </TimeCell>
              <ActionCell />
            </FlexTableRow>
            <FlexTableBody>
              {projects.map(project => (
                <FlexTableRow key={project.id}>
                  <ProjectListViewItem
                    key={project.id}
                    project={project}
                    isStarred={isStarred[project.id] || false}
                    selectedProjectId={selectedProject?.id}
                    onProjectStarClick={handleProjectStarClick}
                    onProjectUpdate={handleProjectUpdate}
                    onProjectSelect={handleProjectSelect}
                    onProjectOpen={() => handleProjectOpen(project.sceneId)}
                  />
                </FlexTableRow>
              ))}
            </FlexTableBody>
          </FlexTable>
        )}
        {isLoading && hasMoreProjects && <Loading relative />}
      </ProjectsWrapper>
      {projectCreatorVisible && (
        <ProjectCreatorModal
          visible={projectCreatorVisible}
          onClose={closeProjectCreator}
          onProjectCreate={handleProjectCreate}
        />
      )}
    </Wrapper>
  );
};

export default Projects;

const Wrapper = styled("div")(() => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
}));

const ProjectsWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px ${theme.spacing.largest}px`,
  overflow: "auto",
  maxHeight: "calc(100vh - 76px)",
}));

const ProjectsGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing.normal,
  width: "100%",
  gridTemplateColumns: "repeat(4, 1fr)",

  "@media (max-width: 1200px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  "@media (max-width: 900px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  "@media (max-width: 600px)": {
    gridTemplateColumns: "1fr",
  },
}));

const FlexTable = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
}));

const FlexTableBody = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}));

const FlexTableRow = styled("div")(() => ({
  display: "flex",
  width: "100%",
}));

const ActionCell = styled("div")(() => ({
  flex: 0.2,
}));

const ProjectNameCell = styled("div")(() => ({
  flex: 1,
}));

const TimeCell = styled("div")(() => ({
  flex: 0.5,
}));
