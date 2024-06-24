import { FC, useRef, MouseEvent } from "react";

import Loading from "@reearth/beta/components/Loading";
import { PopupMenuItem, Typography } from "@reearth/beta/lib/reearth-ui";
import { onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { TabProps } from "..";
import { Project as ProjectType } from "../../type";
import { CommonHeader } from "../header";

import useHooks from "./hooks";
import { Project } from "./project";
import { ProjectModal } from "./projectModal";

const options = [{ value: "date", label: "Latest modified" }];

export type LayoutProps = {
  project: ProjectType;
  popupMenu: PopupMenuItem[];
  selectedProjectId?: string;
  isStarred?: boolean;
  isEditing?: boolean;
  projectName?: string;
  isHovered?: boolean;
  onStarClick?: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectOpen?: () => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onDoubleClick?: () => void;
  onHover?: (v: boolean) => void;
};

export const Projects: FC<TabProps> = ({ workspaceId, viewState, onChangeView }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    projects,
    projectLoading,
    hasMoreProjects,
    selectedProject,
    visible,
    isStarred,
    handleGetMoreProjects,
    handleVisibility,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleStarClick,
  } = useHooks(workspaceId);
  const theme = useTheme();
  const t = useT();

  return (
    <Wrapper>
      <CommonHeader
        viewState={viewState || ""}
        title={t("New Project")}
        appearance="primary"
        icon="plus"
        options={options}
        onChangeView={onChangeView}
        onClick={handleVisibility}
      />
      <ProjectsWrapper
        ref={wrapperRef}
        onScroll={e => {
          !projectLoading && hasMoreProjects && onScrollToBottom(e, handleGetMoreProjects);
        }}>
        {viewState === "grid" && (
          <ProjectsGrid>
            {projects.map(project => (
              <Project
                key={project.id}
                viewState={viewState}
                project={project}
                isStarred={isStarred[project.id] || false}
                onStarClick={handleStarClick}
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
                    onStarClick={handleStarClick}
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
        {projectLoading && hasMoreProjects && <Loading relative />}
      </ProjectsWrapper>
      {visible && (
        <ProjectModal
          visible={visible}
          onClose={handleVisibility}
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
}));

const ProjectsGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing.normal,
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
