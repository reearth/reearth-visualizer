import Dashboard from "@reearth/beta/features/Dashboard";
import Page from "@reearth/beta/pages/Page";
import { FC } from "react";
import { useParams } from "react-router-dom";

const DashboardPage: FC = () => {
  const { workspaceId } = useParams();

  return (
    <Page
      workspaceId={workspaceId}
      renderItem={(props) => <Dashboard {...props} />}
    />
  );
};

export default DashboardPage;
