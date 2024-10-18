import {
  ManagerContent,
  ManagerWrapper
} from "@reearth/beta/ui/components/ManagerBase";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";
import RecycleBinProject from "./RecycleBinProject";

const RecycleBin: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const { deletedProjects, handleProjectRecovery, handleProjectDelete } =
    useHooks(workspaceId);

  return (
    <ManagerWrapper>
      <ManagerContent>
        <ContentWrapper>
          <ProjectsWrapper>
            <ProjectsContainer>
              <ProjectsGroup>
                {deletedProjects?.map((project) => (
                  <RecycleBinProject
                    key={project?.id}
                    project={project}
                    onProjectRecovery={() => handleProjectRecovery(project)}
                    onProjectDelete={() => handleProjectDelete(project)}
                  />
                ))}
              </ProjectsGroup>
            </ProjectsContainer>
          </ProjectsWrapper>
        </ContentWrapper>
      </ManagerContent>
    </ManagerWrapper>
  );
};

export default RecycleBin;

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  flex: 1,
  height: 0
}));

const ProjectsWrapper = styled("div")(() => ({
  overflow: "auto"
}));

const ProjectsContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing.largest
}));

const ProjectsGroup = styled("div")(({ theme }) => ({
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
}));
