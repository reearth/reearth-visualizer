import React, { ReactElement, ReactNode, useMemo } from "react";

import { AuthenticationRequiredPage } from "@reearth/services/auth";
import { useGetMeQuery, useGetProjectQuery, useGetSceneQuery } from "@reearth/services/gql";
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

  useGetMeQuery();

  const { data: sceneData, loading: loadingScene } = useGetSceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const currentProjectId = useMemo(
    () =>
      projectId ?? (sceneData?.node?.__typename === "Scene" ? sceneData.node.projectId : undefined),
    [projectId, sceneData?.node],
  );

  const currentWorkspaceId = useMemo(
    () =>
      workspaceId ?? (sceneData?.node?.__typename === "Scene" ? sceneData.node.teamId : undefined),
    [workspaceId, sceneData?.node],
  );

  const { loading: loadingProject } = useGetProjectQuery({
    variables: {
      projectId: currentProjectId ?? "",
    },
    skip: !currentProjectId,
  });

  const childrenWithProps = React.Children.map(children, child => {
    return React.cloneElement(child as ReactElement<Props>, {
      sceneId,
      projectId: currentProjectId,
      workspaceId: currentWorkspaceId,
    });
  });

  const loading = loadingScene ?? loadingProject;

  return loading ? (
    <Loading animationSize={80} animationColor={theme.general.select} />
  ) : (
    <>{childrenWithProps}</>
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
