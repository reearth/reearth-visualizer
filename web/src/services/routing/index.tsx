import { lazy } from "react";
import { Navigate, useParams, createBrowserRouter, RouterProvider } from "react-router-dom";

import RootPage from "@reearth/classic/components/pages/Authentication/RootPage";
import Dashboard from "@reearth/classic/components/pages/Dashboard";
import AccountSettings from "@reearth/classic/components/pages/Settings/Account";
import ProjectSettings from "@reearth/classic/components/pages/Settings/Project";
import DatasetSettings from "@reearth/classic/components/pages/Settings/Project/Dataset";
import PluginSettings from "@reearth/classic/components/pages/Settings/Project/Plugin";
import PublicSettings from "@reearth/classic/components/pages/Settings/Project/Public";
import SettingsProjectList from "@reearth/classic/components/pages/Settings/ProjectList";
import WorkspaceSettings from "@reearth/classic/components/pages/Settings/Workspace";
import AssetSettings from "@reearth/classic/components/pages/Settings/Workspace/Asset";
import WorkspaceList from "@reearth/classic/components/pages/Settings/WorkspaceList";
import { styled } from "@reearth/services/theme";

const BetaEditor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const BetaProjectSettings = lazy(() => import("@reearth/beta/pages/ProjectSettingsPage"));

const NotFound = lazy(() => import("@reearth/beta/components/NotFound"));
const LoginPage = lazy(() => import("@reearth/classic/components/pages/Authentication/LoginPage"));
const PasswordResetPage = lazy(
  () => import("@reearth/classic/components/pages/Authentication/PasswordReset"),
);

const SignupPage = lazy(
  () => import("@reearth/classic/components/pages/Authentication/SignupPage"),
);
const Preview = lazy(() => import("@reearth/classic/components/pages/Preview"));
const EarthEditor = lazy(() => import("@reearth/classic/components/pages/EarthEditor"));

const GraphQLPlayground = lazy(() => import("@reearth/beta/pages/GraphQLPlayground"));
const PluginEditor = lazy(() => import("@reearth/classic/components/pages/PluginEditor"));

export const AppRoutes = () => {
  const redirectRoutes = redirects.map(([from, to]) => ({
    path: from,
    element: <Redirect to={to} />,
  }));

  const router = createBrowserRouter([
    /* Beta routes - start */
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
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "signup",
      element: <SignupPage />,
    },
    {
      path: "password-reset",
      element: <PasswordResetPage />,
    },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    {
      path: "dashboard/:workspaceId",
      element: <Dashboard />,
    },
    {
      path: "edit/:sceneId",
      children: [
        {
          index: true,
          element: <EarthEditor />,
        },
        { path: "preview", element: <Preview /> },
      ],
    },
    {
      path: "plugin-editor",
      element: <PluginEditor />,
    },
    {
      path: "settings",
      children: [
        { index: true, element: <Navigate to="/settings/account" /> },
        { path: "account", element: <AccountSettings /> },
        {
          path: "workspaces",
          children: [
            {
              index: true,
              element: <WorkspaceList />,
            },
            {
              path: ":workspaceId",
              children: [
                { index: true, element: <WorkspaceSettings /> },
                { path: "projects", element: <SettingsProjectList /> },
                { path: "asset", element: <AssetSettings /> },
              ],
            },
          ],
        },
        {
          path: "projects/:projectId",
          children: [
            { index: true, element: <ProjectSettings /> },
            { path: "public", element: <PublicSettings /> },
            { path: "dataset", element: <DatasetSettings /> },
            { path: "plugins", element: <PluginSettings /> },
          ],
        },
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
