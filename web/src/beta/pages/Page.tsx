import React, { ReactNode, useMemo } from "react";

import GlobalModal from "@reearth/classic/components/organisms/GlobalModal"; // todo: migrate to beta
import { useMeFetcher, useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import { AuthenticatedPage } from "@reearth/services/auth";
import { StoryFragmentFragment } from "@reearth/services/gql";
import { useTheme } from "@reearth/services/theme";

import Loading from "../components/Loading";

type RenderItemProps = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  stories: StoryFragmentFragment[];
};

type Props = {
  sceneId?: string;
  projectId?: string;
  workspaceId?: string;
  renderItem: (props: RenderItemProps) => ReactNode;
};

const PageWrapper: React.FC<Props> = ({ sceneId, projectId, workspaceId, renderItem }) => {
  const theme = useTheme();

  const { useMeQuery } = useMeFetcher();
  const { useProjectQuery } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { loading: loadingMe } = useMeQuery();

  const { scene, loading: loadingScene } = useSceneQuery({ sceneId });

  console.log(scene);

  const currentProjectId = useMemo(
    () => projectId ?? scene?.projectId,
    [projectId, scene?.projectId],
  );

  const currentWorkspaceId = useMemo(
    () => workspaceId ?? scene?.teamId,
    [workspaceId, scene?.teamId],
  );

  const { loading: loadingProject } = useProjectQuery(currentProjectId);

  const loading = useMemo(
    () => loadingMe ?? loadingScene ?? loadingProject,
    [loadingMe, loadingScene, loadingProject],
  );

  return loading ? (
    <Loading animationSize={80} animationColor={theme.select.main} />
  ) : (
    <>
      <GlobalModal />
      {renderItem({
        sceneId,
        projectId: currentProjectId,
        workspaceId: currentWorkspaceId,
        stories: scene?.stories ?? [],
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
