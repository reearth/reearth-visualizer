import React, { ReactNode, useMemo } from "react";

import { useMeFetcher, useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import { AuthenticatedPage } from "@reearth/services/auth";

import Loading from "../components/Loading";

type RenderItemProps = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
};

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  renderItem: (props: RenderItemProps) => ReactNode;
};

const PageWrapper: React.FC<Props> = ({ sceneId, projectId, workspaceId, renderItem }) => {
  const { useMeQuery } = useMeFetcher();
  const { useProjectQuery } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { loading: loadingMe } = useMeQuery();

  const { scene, loading: loadingScene } = useSceneQuery({ sceneId });

  const currentProjectId = useMemo(
    () => projectId ?? scene?.projectId,
    [projectId, scene?.projectId],
  );

  const currentWorkspaceId = useMemo(
    () => workspaceId ?? scene?.workspaceId,
    [workspaceId, scene?.workspaceId],
  );

  const { loading: loadingProject } = useProjectQuery(currentProjectId);

  const loading = useMemo(
    () => loadingMe ?? loadingScene ?? loadingProject,
    [loadingMe, loadingScene, loadingProject],
  );

  return loading ? (
    <Loading animationSize={80} />
  ) : (
    <>
      {renderItem({
        sceneId,
        projectId: currentProjectId,
        workspaceId: currentWorkspaceId,
      })}
    </>
  );
};

const Page: React.FC<Props> = ({ sceneId, projectId, workspaceId, renderItem }) => (
  <AuthenticatedPage>
    <PageWrapper
      sceneId={sceneId}
      projectId={projectId}
      workspaceId={workspaceId}
      renderItem={renderItem}
    />
  </AuthenticatedPage>
);

export default Page;
