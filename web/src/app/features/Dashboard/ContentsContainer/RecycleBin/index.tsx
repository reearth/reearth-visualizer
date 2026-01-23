import { Loading, Typography } from "@reearth/app/lib/reearth-ui";
import {
  ManagerContent,
  ManagerWrapper
} from "@reearth/app/ui/components/ManagerBase";
import ManagerEmptyContent from "@reearth/app/ui/components/ManagerBase/ManagerEmptyContent";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";
import RecycleBinItem from "./items/RecycleBinItem";

const RecycleBin: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const {
    filteredDeletedProjects,
    isLoading,
    disabled,
    handleProjectRecovery,
    handleProjectDelete
  } = useHooks(workspaceId);

  const t = useT();
  const theme = useTheme();

  return (
    <ManagerWrapper>
      {filteredDeletedProjects?.length ? (
        <ManagerContent>
          <ContentWrapper>
            <ProjectsWrapper>
              <ProjectsContainer>
                <ProjectsGroup>
                  {filteredDeletedProjects?.map((project) => (
                    <RecycleBinItem
                      key={project?.id}
                      project={project}
                      disabled={disabled}
                      onProjectRecovery={() => handleProjectRecovery(project)}
                      onProjectDelete={() =>
                        project && handleProjectDelete(project.id)
                      }
                    />
                  ))}
                </ProjectsGroup>
              </ProjectsContainer>
            </ProjectsWrapper>
          </ContentWrapper>
        </ManagerContent>
      ) : isLoading ? (
        <LoadingWrapper>
          <Loading relative />
        </LoadingWrapper>
      ) : (
        <ManagerEmptyContent>
          <Typography size="h5" color={theme.content.weak}>
            {t("No Project in Recycle bin.")}
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100vh"
}));
