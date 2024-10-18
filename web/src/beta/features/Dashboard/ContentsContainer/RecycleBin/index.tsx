import { Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import {
  ManagerContent,
  ManagerWrapper
} from "@reearth/beta/ui/components/ManagerBase";
import ManagerEmptyContent from "@reearth/beta/ui/components/ManagerBase/ManagerEmptyContent";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";
import RecycleBinItem from "./items/RecycleBinItem";
import ProjectDeleteModal from "./ProjectDeleteModal";

const RecycleBin: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    filteredDeletedProjects,
    isLoading,
    deleteModalVisible,
    handleDeleteModalClose,
    handleProjectRecovery,
    handleProjectDelete
  } = useHooks(workspaceId);

  const t = useT();
  const theme = useTheme();

  return (
    <ManagerWrapper>
      {filteredDeletedProjects.length ? (
        <ManagerContent>
          <ContentWrapper>
            <ProjectsWrapper>
              <ProjectsContainer>
                <ProjectsGroup>
                  {filteredDeletedProjects?.map((project) => (
                    <>
                      <RecycleBinItem
                        key={project?.id}
                        project={project}
                        onProjectRecovery={() => handleProjectRecovery(project)}
                        onProjectDelete={() => handleDeleteModalClose(true)}
                      />
                      {deleteModalVisible && (
                        <ProjectDeleteModal
                          isVisible={deleteModalVisible}
                          project={project}
                          onClose={() => handleDeleteModalClose(false)}
                          onProjectDelete={() => handleProjectDelete(project)}
                        />
                      )}
                    </>
                  ))}
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
      ) : (
        <ManagerEmptyContent>
          <Typography size="h5" color={theme.content.weak}>
            {t("No Project in recycle bin.")}
          </Typography>
        </ManagerEmptyContent>
      )}
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

const LoadingWrapper = styled("div")(() => ({
  width: "100%",
  height: 100
}));
