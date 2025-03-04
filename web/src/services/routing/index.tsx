import RootPage from "@reearth/beta/pages/RootPage";
import { styled } from "@reearth/services/theme";
import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Dashboard = lazy(() => import("@reearth/beta/pages/Dashboard"));
const Editor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const ProjectSettings = lazy(
  () => import("@reearth/beta/pages/ProjectSettingsPage")
);
const AccountSettingPage = lazy(
  () => import("@reearth/beta/pages/AccountSettingsPage")
);
const WorkspaceSettingPage = lazy(
  () => import("@reearth/beta/pages/WorkspaceSettingPage")
);
const PluginPlaygroundPage = lazy(
  () => import("@reearth/beta/pages/PluginPlaygroundPage")
);
const NotFoundPage = lazy(() => import("@reearth/beta/pages/NotFound"));

const GraphQLPlayground = lazy(
  () => import("@reearth/beta/pages/GraphQLPlayground")
);

export const AppRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "dashboard/:workspaceId/",
      element: <Dashboard />
    },
    {
      path: "dashboard/:workspaceId/:tab",
      element: <Dashboard />
    },
    {
      path: "scene/:sceneId/:tab",
      element: <Editor />
    },
    {
      path: "settings/projects/:projectId/:tab?/:subId?",
      element: <ProjectSettings />
    },
    {
      path: "settings/account",
      element: <AccountSettingPage />
    },
    {
      path: "settings/workspaces/:workspaceId",
      element: <WorkspaceSettingPage tab="workspace" />
    },
    {
      path: "graphql",
      element: <GraphQLPlayground />
    },
    {
      index: true,
      element: <RootPage />
    },
    {
      path: "auth/*",
      element: <RootPage />
    },
    {
      path: "plugin-playground",
      element: <PluginPlaygroundPage />
    },
    {
      path: "*",
      element: <NotFoundPage />
    }
  ]);

  return <StyledRouter router={router} />;
};

const StyledRouter = styled(RouterProvider)`
  height: 100%;
`;
