import React, { ReactElement, ReactNode, useMemo } from "react";

import GlobalModal from "@reearth/classic/components/organisms/GlobalModal"; // todo: migrate to beta
import { useMeFetcher, useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import { AuthenticationRequiredPage } from "@reearth/services/auth";
import { useTheme } from "@reearth/services/theme";

import Loading from "../components/Loading";

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  children?: ReactNode;
};

const PageWrapper: React.FC<Props> = ({ sceneId, projectId, workspaceId, children }) => {
  const theme = useTheme();

  const { useMeQuery } = useMeFetcher();
  const { useProjectQuery } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { loading: loadingMe } = useMeQuery();

  const { scene, loading: loadingScene } = useSceneQuery(sceneId);

  const currentProjectId = useMemo(
    () => projectId ?? scene?.projectId,
    [projectId, scene?.projectId],
  );

  const currentWorkspaceId = useMemo(
    () => workspaceId ?? scene?.teamId,
    [workspaceId, scene?.teamId],
  );

  const { loading: loadingProject } = useProjectQuery(currentProjectId);

  const childrenWithProps = React.Children.map(children, child => {
    return React.cloneElement(child as ReactElement<Props>, {
      sceneId,
      projectId: currentProjectId,
      workspaceId: currentWorkspaceId,
    });
  });

  const loading = useMemo(
    () => loadingMe ?? loadingScene ?? loadingProject,
    [loadingMe, loadingScene, loadingProject],
  );

  return loading ? (
    <Loading animationSize={80} animationColor={theme.general.select} />
  ) : (
    <>
      <GlobalModal />
      {childrenWithProps}
    </>
  );
};

const Page: React.FC<Props> = ({ sceneId, projectId, workspaceId, children }) => (
  <AuthenticationRequiredPage>
    <PageWrapper sceneId={sceneId} projectId={projectId} workspaceId={workspaceId}>
      {children}
    </PageWrapper>
  </AuthenticationRequiredPage>
);

export default Page;
