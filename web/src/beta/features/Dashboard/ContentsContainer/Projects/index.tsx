import { Breadcrumb, Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import Tooltip from "@reearth/beta/lib/reearth-ui/components/Tooltip";
import {
  ManagerContent,
  ManagerHeader,
  ManagerHeaderButton,
  ManagerLayout,
  ManagerWrapper
} from "@reearth/beta/ui/components/ManagerBase";
import ManagerEmptyContent from "@reearth/beta/ui/components/ManagerBase/ManagerEmptyContent";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo, useRef, Fragment } from "react";

import useHooks from "./hooks";
import ProjectGridViewItem from "./Project/ProjectGridViewItem";
import ProjectListViewItem from "./Project/ProjectListViewItem";
import ProjectCreatorModal from "./ProjectCreatorModal";

const Projects: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    filtedProjects,
    isLoading,
    selectedProject,
    projectCreatorVisible,
    wrapperRef,
    contentRef,
    contentWidth,
    layout,
    searchTerm,
    sortValue,
    showProjectCreator,
    closeProjectCreator,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleLayoutChange,
    handleProjectSortChange,
    handleSearch,
    handleProjectImport,
    handleProjectRemove
  } = useHooks(workspaceId);

  const theme = useTheme();
  const t = useT();
  const sortOptions: { value: string; label: string }[] = useMemo(
    () => [
      { value: "date", label: t("Last Created") },
      { value: "date-reversed", label: t("First Created") },
      { value: "date-updated", label: t("Last Updated") },
      { value: "name", label: t("A To Z") },
      { value: "name-reverse", label: t("Z To A") }
    ],
    [t]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <ManagerWrapper onClick={() => handleProjectSelect(undefined)}>
      <ManagerHeader
        size="large"
        actions={[
          <Fragment key="action-buttons">
            <ManagerHeaderButton
              key={"create-project"}
              title={t("New Project")}
              managerSize="large"
              icon="plus"
              appearance="primary"
              onClick={showProjectCreator}
            />
            <ManagerHeaderButton
              key={"import-project"}
              title={t("Import")}
              managerSize="large"
              icon="signIn"
              appearance="secondary"
              onClick={() => fileInputRef.current?.click()}
              tileComponent={<Tooltip type="experimental" />}
            />
            <HiddenFileInput
              type="file"
              accept=".zip"
              ref={fileInputRef}
              onChange={handleProjectImport}
            />
          </Fragment>
        ]}
        sortValue={sortValue}
        sortOptions={sortOptions}
        onSortChange={handleProjectSortChange}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        showSearch
        searchPlaceholder={t("Search project")}
        onSearch={handleSearch}
      />
      {filtedProjects?.length ? (
        <ManagerContent>
          <ContentWrapper>
            <BreadcrumbContainer>
              <Breadcrumb
                items={[
                  {
                    title: (
                      <Typography
                        size="h5"
                        weight="bold"
                        color={theme.content.weak}
                      >
                        {t("All projects")}
                      </Typography>
                    )
                  },
                  ...(searchTerm
                    ? [
                        {
                          title: (
                            <Typography
                              size="h5"
                              weight="bold"
                              color={theme.content.weak}
                            >
                              {`${t("Search Result for")} "${searchTerm}"`}
                            </Typography>
                          )
                        }
                      ]
                    : [])
                ]}
              />
            </BreadcrumbContainer>
            {layout === "list" && (
              <ListHeader width={contentWidth}>
                <ThumbnailCol />
                <ProjectNameCol>
                  <Typography size="body" color={theme.content.weak}>
                    {t("Project Name")}
                  </Typography>
                </ProjectNameCol>
                <TimeCol>
                  <Typography size="body" color={theme.content.weak}>
                    {t("Updated At")}
                  </Typography>
                </TimeCol>
                <TimeCol>
                  <Typography size="body" color={theme.content.weak}>
                    {t("Created At")}
                  </Typography>
                </TimeCol>
                <ActionCol />
              </ListHeader>
            )}
            <ProjectsWrapper ref={wrapperRef}>
              <ProjectsContainer ref={contentRef}>
                <ProjectsGroup layout={layout}>
                  {filtedProjects.map((project) =>
                    layout === "grid" ? (
                      <ProjectGridViewItem
                        key={project.id}
                        project={project}
                        selectedProjectId={selectedProject?.id}
                        onProjectUpdate={handleProjectUpdate}
                        onProjectSelect={handleProjectSelect}
                        onProjectOpen={() => handleProjectOpen(project.sceneId)}
                        onProjectRemove={() => handleProjectRemove(project)}
                      />
                    ) : (
                      <ProjectListViewItem
                        key={project.id}
                        project={project}
                        selectedProjectId={selectedProject?.id}
                        onProjectUpdate={handleProjectUpdate}
                        onProjectSelect={handleProjectSelect}
                        onProjectOpen={() => handleProjectOpen(project.sceneId)}
                        onProjectRemove={() => handleProjectRemove(project)}
                      />
                    )
                  )}
                </ProjectsGroup>
              </ProjectsContainer>
              {isLoading && (
                <LoadingWrapper>
                  <Loading relative />
                </LoadingWrapper>
              )}
            </ProjectsWrapper>
          </ContentWrapper>
        </ManagerContent>
      ) : isLoading ? (
        <Loading relative />
      ) : (
        <ManagerEmptyContent>
          <Typography size="h5" color={theme.content.weak}>
            {t("No Project has been created yet")}
          </Typography>
        </ManagerEmptyContent>
      )}

      {projectCreatorVisible && (
        <ProjectCreatorModal
          visible={projectCreatorVisible}
          onClose={closeProjectCreator}
          onProjectCreate={handleProjectCreate}
        />
      )}
    </ManagerWrapper>
  );
};

export default Projects;

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  flex: 1,
  height: 0
}));

const ProjectsWrapper = styled("div")(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "auto"
}));

const BreadcrumbContainer = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.largest}px`
}));

const ProjectsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.large,
  flexDirection: "column",
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px ${theme.spacing.largest}px`
}));

const ProjectsGroup = styled("div")<{ layout: ManagerLayout }>(
  ({ theme, layout }) => ({
    ...(layout === "grid"
      ? {
          display: "grid",
          gap: theme.spacing.normal,
          width: "100%",
          gridTemplateColumns: "repeat(4, 1fr)",

          "@media (max-width: 1200px)": {
            gridTemplateColumns: "repeat(3, 1fr)"
          },
          "@media (max-width: 900px)": {
            gridTemplateColumns: "repeat(2, 1fr)"
          },
          "@media (max-width: 600px)": {
            gridTemplateColumns: "1fr"
          }
        }
      : {}),
    ...(layout === "list"
      ? {
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.normal
        }
      : {})
  })
);

const ListHeader = styled("div")<{ width: number }>(({ width, theme }) => ({
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  padding: `${theme.spacing.smallest}px ${theme.spacing.largest}px`,
  width: width === 0 ? "100%" : width
}));

const ThumbnailCol = styled("div")(() => ({
  width: 120,
  flexShrink: 0
}));

const ProjectNameCol = styled("div")(() => ({
  flex: 1,
  flexShrink: 0
}));

const TimeCol = styled("div")(() => ({
  flex: "0 0 20%",
  flexShrink: 0
}));

const ActionCol = styled("div")(() => ({
  flex: "0 0 10%",
  flexShrink: 0
}));

const LoadingWrapper = styled("div")(() => ({
  width: "100%",
  height: 100
}));

const HiddenFileInput = styled("input")({
  display: "none"
});
