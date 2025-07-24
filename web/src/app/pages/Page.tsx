import {
  useMeFetcher,
  useProjectFetcher,
  useSceneFetcher
} from "@reearth/services/api";
import { AuthenticatedPage } from "@reearth/services/auth";
import { FC, ReactNode, useMemo } from "react";

import { Loading } from "../lib/reearth-ui";

import NotFound from "./NotFound";

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

const PageWrapper: FC<Props> = ({
  sceneId,
  projectId,
  workspaceId,
  renderItem
}) => {
  const { useMeQuery } = useMeFetcher();
  const { useProjectQuery } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { loading: loadingMe } = useMeQuery();
  const { scene, loading: loadingScene } = useSceneQuery({ sceneId });

  const currentProjectId = useMemo(
    () => projectId ?? scene?.projectId,
    [projectId, scene?.projectId]
  );

  const currentWorkspaceId = useMemo(
    () => workspaceId ?? scene?.workspaceId,
    [workspaceId, scene?.workspaceId]
  );

  const { loading: loadingProject, project } =
    useProjectQuery(currentProjectId);

  const loading = useMemo(
    () => loadingMe || loadingScene || loadingProject,
    [loadingMe, loadingScene, loadingProject]
  );

  const renderContent = useMemo(() => {
    if (loading) return <Loading includeLogo />;

    if (project?.isDeleted) return <NotFound />;

    return renderItem({
      sceneId,
      projectId: currentProjectId,
      workspaceId: currentWorkspaceId
    });
  }, [
    loading,
    project?.isDeleted,
    sceneId,
    currentProjectId,
    currentWorkspaceId,
    renderItem
  ]);

  return renderContent;
};

const Page: FC<Props> = ({ sceneId, projectId, workspaceId, renderItem }) => (
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
