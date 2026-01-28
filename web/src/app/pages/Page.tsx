import { useAuthenticationRequired } from "@reearth/services/auth/useAuth";
import { FC, ReactNode } from "react";

import { Loading } from "../lib/reearth-ui";

import NotFound from "./NotFound";
import { usePageData } from "./usePageData";

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
  const pageData = usePageData(sceneId, projectId, workspaceId);

  if (pageData.loading) return <Loading includeLogo />;
  if (pageData.isDeleted) return <NotFound />;

  return (
    <>
      {renderItem({
        sceneId,
        projectId: pageData.projectId,
        workspaceId: pageData.workspaceId
      })}
    </>
  );
};

const Page: FC<Props> = ({ sceneId, projectId, workspaceId, renderItem }) => {
  const [isAuthenticated] = useAuthenticationRequired();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageWrapper
      sceneId={sceneId}
      projectId={projectId}
      workspaceId={workspaceId}
      renderItem={renderItem}
    />
  );
};

export default Page;
