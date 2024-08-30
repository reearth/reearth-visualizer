import RootPage from "@reearth/beta/pages/RootPage";
import { styled } from "@reearth/services/theme";
import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Dashboard = lazy(() => import("@reearth/beta/pages/Dashboard"));
const Editor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const ProjectSettings = lazy(
  () => import("@reearth/beta/pages/ProjectSettingsPage")
);
const PluginPlaygroundPage = lazy(
  () => import("@reearth/beta/pages/PluginPlaygroundPage")
);
const NotFound = lazy(() => import("@reearth/beta/components/NotFound"));
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
      path: "settings/project/:projectId/:tab?/:subId?",
      element: <ProjectSettings />
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
      element: <NotFound />
    }
  ]);

  return <StyledRouter router={router} />;
};

const StyledRouter = styled(RouterProvider)`
  height: 100%;
`;
