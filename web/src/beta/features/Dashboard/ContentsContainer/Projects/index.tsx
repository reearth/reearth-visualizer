import { FC, useMemo } from "react";

import { Breadcrumb, Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import { ManagerHeader, ManagerHeaderButton } from "@reearth/beta/ui/components/ManagerBase";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

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
    layout,
    favoriteProjects,
    searchTerm,
    sortValue,
    showProjectCreator,
    closeProjectCreator,
    handleGetMoreProjects,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleScrollToBottom,
    handleLayoutChange,
    handleProjectSortChange,
    handleSearch,
  } = useHooks(workspaceId);

  const theme = useTheme();
  const t = useT();
  const sortOptions: { value: string; label: string }[] = useMemo(
    () => [
      { value: "date", label: t("Last Created") },
      { value: "date-reversed", label: t("First Created") },
      // TODO: After backend fix
      // { value: "date-updated", label: t("Last Updated") },
      // { value: "name", label: t("A To Z") },
      // { value: "name-reverse", label: t("Z To A") },
    ],
    [t],
  );

  return (
    <Wrapper onClick={() => handleProjectSelect(undefined)}>
      <ManagerHeader
        size="large"
        actions={[
          <ManagerHeaderButton
            key={"create-project"}
            title={t("New Project")}
            managerSize="large"
            icon="plus"
            appearance="primary"
            onClick={showProjectCreator}
          />,
        ]}
        sortValue={sortValue}
        sortOptions={sortOptions}
        onSortChange={handleProjectSortChange}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        showSearch
        searchPlaceholder={t("Search in all assets library")}
        onSearch={handleSearch}
      />
      <ProjectsWrapper
        ref={wrapperRef}
        onScroll={e => {
          !isLoading && hasMoreProjects && handleScrollToBottom(e, handleGetMoreProjects);
        }}>
        <BreadcrumbContainer>
          {favoriteProjects.length > 0 && (
            <Breadcrumb
              items={[
                {
                  title: (
                    <Typography size="h5" weight="bold" color={theme.content.weak}>
                      Stars
                    </Typography>
                  ),
                },
                ...(searchTerm
                  ? [
                      {
                        title: (
                          <Typography size="h5" weight="bold" color={theme.content.weak}>
                            {searchTerm}
                          </Typography>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </BreadcrumbContainer>
        {layout === "grid" && (
          <ProjectsContainer>
            {favoriteProjects.length > 0 && (
              <ProjectsGrid>
                {favoriteProjects.map(project => (
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
            <Breadcrumb
              items={[
                {
                  title: (
                    <Typography
                      size="h5"
                      weight="bold"
                      color={theme.content.weak}
                      onClick={() => handleSearch(undefined)}>
                      All Projects
                    </Typography>
                  ),
                },
                ...(searchTerm
                  ? [
                      {
                        title: (
                          <Typography size="h5" weight="bold" color={theme.content.weak}>
                            {searchTerm}
                          </Typography>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
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
          </ProjectsContainer>
        )}
        {layout === "list" && (
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
              <ProjectsContainer>
                {favoriteProjects.length > 0 &&
                  favoriteProjects.map(project => (
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
                          size="h5"
                          weight="bold"
                          color={theme.content.weak}
                          onClick={() => handleSearch(undefined)}>
                          All Projects
                        </Typography>
                      ),
                    },
                    ...(searchTerm
                      ? [
                          {
                            title: (
                              <Typography size="h5" weight="bold" color={theme.content.weak}>
                                {searchTerm}
                              </Typography>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
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
              </ProjectsContainer>
            </FlexTableBody>
          </FlexTable>
        )}
        {isLoading &&
          (hasMoreProjects ? (
            <StyledLoading>
              <Loading relative />
            </StyledLoading>
          ) : (
            <Loading relative />
          ))}
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

const BreadcrumbContainer = styled("div")(({ theme }) => ({
  paddingBottom: theme.spacing.large,
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
