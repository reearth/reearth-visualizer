import { FC, useMemo } from "react";

import { Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import CommonHeader from "../CommonHeader";

import useHooks from "./hooks";
import ProjectGridViewItem from "./Project/ProjectGridViewItem";
import ProjectListViewItem from "./Project/ProjectListViewItem";
import ProjectCreatorModal from "./ProjectCreatorModal";

const Projects: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    projects,
    isLoading,
    hasMoreProjects,
    selectedProject,
    projectCreatorVisible,
    wrapperRef,
    viewState,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleScrollToBottom,
    handleViewStateChange,
    handleProjectSortChange,
  } = useHooks(workspaceId);

  const theme = useTheme();
  const t = useT();
  const sortOptions: { value: string; label: string }[] = useMemo(
    () => [
      { value: "date", label: t("Created At") },
      { value: "date-updated", label: t("Last Uploaded") },
      { value: "name", label: t("A To Z") },
      { value: "name-reverse", label: t("Z To A") },
    ],
    [t],
  );
  return (
    <Wrapper onClick={() => handleProjectSelect(undefined)}>
      <CommonHeader
        viewState={viewState || ""}
        title={t("New Project")}
        appearance="primary"
        icon="plus"
        options={sortOptions}
        onChangeView={handleViewStateChange}
        onClick={showProjectCreator}
        onSortChange={handleProjectSortChange}
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
                selectedProjectId={selectedProject?.id}
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
                    selectedProjectId={selectedProject?.id}
                    onProjectUpdate={handleProjectUpdate}
                    onProjectSelect={handleProjectSelect}
                    onProjectOpen={() => handleProjectOpen(project.sceneId)}
                  />
                </FlexTableRow>
              ))}
            </FlexTableBody>
          </FlexTable>
        )}
        {isLoading && hasMoreProjects && (
          <StyledLoading>
            <Loading relative />
          </StyledLoading>
        )}
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
  boxSizing: "border-box",
}));

const ProjectsWrapper = styled("div")(({ theme }) => ({
  overflowY: "auto",
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px ${theme.spacing.largest}px`,
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

const StyledLoading = styled("div")(() => ({
  margin: "52px auto",
}));
