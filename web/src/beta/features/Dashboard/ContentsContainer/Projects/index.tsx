import { FC, MouseEvent } from "react";

import { Loading, PopupMenuItem, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { Project as ProjectType } from "../../type";
import { CommonHeader } from "../header";

import useHooks from "./hooks";
import { Project } from "./project";
import { ProjectModal } from "./projectModal";

const options = [{ value: "date", label: "Latest modified" }];

export type ProjectProps = {
  project: ProjectType;
  popupMenu: PopupMenuItem[];
  selectedProjectId?: string;
  isStarred?: boolean;
  isEditing?: boolean;
  projectName?: string;
  isHovered?: boolean;
  viewState?: string;
  onProjectStarClick?: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectOpen?: () => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (e: MouseEvent<Element>, projectId?: string) => void;
  onProjectBlur?: () => void;
  onProjectChange?: (value: string) => void;
  onProjectNameEdit?: (e: MouseEvent<Element>) => void;
  onProjectHover?: (v: boolean) => void;
  onProjectChangeView?: (v?: string) => void;
};

export const Projects: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    projects,
    isLoading,
    hasMoreProjects,
    selectedProject,
    visible,
    isStarred,
    wrapperRef,
    viewState,
    handleGetMoreProjects,
    handleProjectModalVisibility,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleProjectStarClick,
    onScrollToBottom,
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
        onClick={handleProjectModalVisibility}
      />
      <ProjectsWrapper
        ref={wrapperRef}
        onScroll={e => {
          !isLoading && hasMoreProjects && onScrollToBottom(e, handleGetMoreProjects);
        }}>
        {viewState === "grid" && (
          <ProjectsGrid>
            {projects.map(project => (
              <Project
                key={project.id}
                viewState={viewState}
                project={project}
                isStarred={isStarred[project.id] || false}
                onProjectStarClick={handleProjectStarClick}
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
                  <Project
                    key={project.id}
                    viewState={viewState}
                    project={project}
                    isStarred={isStarred[project.id] || false}
                    onProjectStarClick={handleProjectStarClick}
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
        {isLoading && hasMoreProjects && <Loading relative />}
      </ProjectsWrapper>
      {visible && (
        <ProjectModal
          visible={visible}
          onClose={handleProjectModalVisibility}
          onProjectCreate={handleProjectCreate}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  gap: theme.spacing.large,
}));

const ProjectsWrapper = styled("div")(() => ({
  overflow: "auto",
  maxHeight: "calc(100vh - 24px)",
  ["* ::-webkit-scrollbar"]: {
    width: "8px",
  },
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
