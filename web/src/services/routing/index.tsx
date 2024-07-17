import { lazy } from "react";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";

import RootPage from "@reearth/beta/pages/RootPage";
import { styled } from "@reearth/services/theme";

const Dashboard = lazy(() => import("@reearth/beta/pages/Dashboard"));
const Editor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const BetaProjectSettings = lazy(() => import("@reearth/beta/pages/ProjectSettingsPage"));
const PluginPlaygroundPage = lazy(() => import("@reearth/beta/pages/PluginPlaygroundPage"));
const NotFound = lazy(() => import("@reearth/beta/components/NotFound"));
const GraphQLPlayground = lazy(() => import("@reearth/beta/pages/GraphQLPlayground"));
// Note: not in use
const AccountSettings = lazy(() => import("@reearth/beta/pages/AccountSettingsPage"));

export const AppRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "dashboard/:workspaceId/",
      element: <Dashboard />,
    },
    {
      path: "dashboard/:workspaceId/:tab",
      element: <Dashboard />,
    },
    {
      path: "scene/:sceneId/:tab",
      element: <Editor />,
    },
    {
      path: "settings/project/:projectId/:tab?/:subId?",
      element: <BetaProjectSettings />,
    },
    {
      path: "graphql",
      element: <GraphQLPlayground />,
    },
    {
      index: true,
      element: <RootPage />,
    },
    {
      path: "auth/*",
      element: <RootPage />,
    },
    {
      path: "plugin-playground",
      element: <PluginPlaygroundPage />,
    },
    {
      path: "settings",
      children: [
        { index: true, element: <Navigate to="/settings/account" /> },
        { path: "account", element: <AccountSettings /> },
        { path: "*", element: <Navigate to="/settings/account" /> },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return <StyledRouter router={router} />;
};

const StyledRouter = styled(RouterProvider)`
  height: 100%;
`;
