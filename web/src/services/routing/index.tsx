import { lazy } from "react";
import { Navigate, useParams, createBrowserRouter, RouterProvider } from "react-router-dom";

import RootPage from "@reearth/beta/pages/Authentication/RootPage";
import Dashboard from "@reearth/beta/pages/Dashboard";
import AccountSettings from "@reearth/beta/pages/Settings/Account";
import { styled } from "@reearth/services/theme";

const BetaEditor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const BetaProjectSettings = lazy(() => import("@reearth/beta/pages/ProjectSettingsPage"));
const PluginPlaygroundPage = lazy(() => import("@reearth/beta/pages/PluginPlaygroundPage"));

const NotFound = lazy(() => import("@reearth/beta/components/NotFound"));

const GraphQLPlayground = lazy(() => import("@reearth/beta/pages/GraphQLPlayground"));

export const AppRoutes = () => {
  const redirectRoutes = redirects.map(([from, to]) => ({
    path: from,
    element: <Redirect to={to} />,
  }));

  const router = createBrowserRouter([
    /* Beta routes - start */
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
      element: <BetaEditor />,
    },
    {
      path: "settings/project/:projectId/:tab?/:subId?",
      element: <BetaProjectSettings />,
    },
    {
      path: "graphql",
      element: <GraphQLPlayground />,
    },
    /* Beta routes - end */
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
    ...redirectRoutes,
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

// Redirections for breaking changes in URLs
const redirects = [
  ["/settings/workspace/:workspaceId", "/settings/workspaces/:workspaceId"],
  ["/settings/workspace/:workspaceId/projects", "/settings/workspaces/:workspaceId/projects"],
  ["/settings/workspace/:workspaceId/asset", "/settings/workspaces/:workspaceId/asset"],
  ["/settings/project/:projectId/dataset", "/settings/projects/:projectId/dataset"],
];

function Redirect({ to }: { to: string }) {
  const { teamId, projectId } = useParams();
  return (
    <Navigate
      to={`${to.replace(":teamId", teamId ?? "").replace(":projectId", projectId ?? "")}`}
    />
  );
}
