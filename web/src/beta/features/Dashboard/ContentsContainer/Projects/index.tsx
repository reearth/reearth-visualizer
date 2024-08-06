import { FC, useMemo } from "react";

import { Breadcrumb, Loading, Typography } from "@reearth/beta/lib/reearth-ui";
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
    favarateProjects,
    searchTerm,
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
    handleSearch,
  } = useHooks(workspaceId);

  const theme = useTheme();
  const t = useT();
  const sortOptions: { value: string; label: string }[] = useMemo(
    () => [
      { value: "date-reversed", label: t("First created") },
      { value: "date", label: t("Last created") },
      { value: "date-updated", label: t("First Updated") },
      { value: "date-updated-reverse", label: t("Last Updated") },
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
        isSearch
        searchTerm={searchTerm}
        onChangeView={handleViewStateChange}
        onClick={showProjectCreator}
        onSortChange={handleProjectSortChange}
        onSearch={handleSearch}
      />
      <ProjectsWrapper
        ref={wrapperRef}
        onScroll={e => {
          !isLoading && hasMoreProjects && handleScrollToBottom(e, handleGetMoreProjects);
        }}>
        <ProjectsContainer>
          {favarateProjects.length > 0 && (
            <Breadcrumb
              items={[{ title: "Stars" }, ...(searchTerm ? [{ title: searchTerm }] : [])]}
            />
          )}
          {viewState === "grid" && (
            <>
              {favarateProjects.length > 0 && (
                <>
                  <ProjectsGrid>
                    {favarateProjects.map(project => (
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
                  <Breadcrumb
                    items={[
                      {
                        title: (
                          <Typography
                            size="body"
                            weight="bold"
                            color={theme.content.weak}
                            onClick={() => handleSearch(undefined)}>
                            All Projects
                          </Typography>
                        ),
                      },
                      ...(searchTerm ? [{ title: searchTerm }] : []),
                    ]}
                  />
                </>
              )}

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
            </>
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
                {favarateProjects.length > 0 && (
                  <>
                    {favarateProjects.map(project => (
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
                    <Breadcrumb
                      items={[
                        {
                          title: (
                            <Typography
                              size="body"
                              weight="bold"
                              color={theme.content.weak}
                              onClick={() => handleSearch(undefined)}>
                              All Projects
                            </Typography>
                          ),
                        },
                        ...(searchTerm ? [{ title: searchTerm }] : []),
                      ]}
                    />
                  </>
                )}

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
        </ProjectsContainer>
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

const ProjectsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.large,
  flexDirection: "column",
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

const FlexTableRow = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.large,
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
