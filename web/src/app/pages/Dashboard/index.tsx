import Dashboard from "@reearth/app/features/Dashboard";
import Page from "@reearth/app/pages/Page";
import { FC } from "react";
import { useParams } from "react-router";

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
