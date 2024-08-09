import { FC } from "react";
import { useParams } from "react-router-dom";

import Dashboard from "@reearth/beta/features/Dashboard";
import Page from "@reearth/beta/pages/Page";

type Props = {};

const DashboardPage: FC<Props> = () => {
  const { workspaceId } = useParams();

  return <Page workspaceId={workspaceId} renderItem={props => <Dashboard {...props} />} />;
};

export default DashboardPage;
