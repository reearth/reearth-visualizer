import React, { Suspense } from "react";
import { BrowserRouter as Router, useRoutes, Navigate, useParams } from "react-router-dom";

import Loading from "@reearth/classic/components/atoms/Loading";
import NotificationBanner from "@reearth/classic/components/organisms/Notification";
import LoginPage from "@reearth/classic/components/pages/Authentication/LoginPage";
import PasswordResetPage from "@reearth/classic/components/pages/Authentication/PasswordReset";
import SignupPage from "@reearth/classic/components/pages/Authentication/SignupPage";
import NotFound from "@reearth/classic/components/pages/NotFound";
import AccountSettings from "@reearth/classic/components/pages/Settings/Account";
import ProjectSettings from "@reearth/classic/components/pages/Settings/Project";
import DatasetSettings from "@reearth/classic/components/pages/Settings/Project/Dataset";
import PluginSettings from "@reearth/classic/components/pages/Settings/Project/Plugin";
import PublicSettings from "@reearth/classic/components/pages/Settings/Project/Public";
import SettingsProjectList from "@reearth/classic/components/pages/Settings/ProjectList";
import WorkspaceSettings from "@reearth/classic/components/pages/Settings/Workspace";
import AssetSettings from "@reearth/classic/components/pages/Settings/Workspace/Asset";
import WorkspaceList from "@reearth/classic/components/pages/Settings/WorkspaceList";
import { Provider as I18nProvider } from "@reearth/services/i18n";

import RootPage from "./classic/components/pages/Authentication/RootPage";
import Preview from "./classic/components/pages/Preview";
import { Provider as Auth0Provider } from "./services/auth";
import { Provider as GqlProvider } from "./services/gql";
import { Provider as ThemeProvider, styled } from "./services/theme";

const EarthEditor = React.lazy(() => import("@reearth/classic/components/pages/EarthEditor"));
const Dashboard = React.lazy(() => import("@reearth/classic/components/pages/Dashboard"));
const GraphQLPlayground = React.lazy(
  () => import("@reearth/classic/components/pages/GraphQLPlayground"),
);
const PluginEditor = React.lazy(() => import("./classic/components/pages/PluginEditor"));

function AppRoutes() {
  return useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/password-reset", element: <PasswordResetPage /> },
    { path: "/dashboard/:workspaceId", element: <Dashboard /> },
    { path: "/edit/:sceneId", element: <EarthEditor /> },
    { path: "/edit/:sceneId/preview", element: <Preview /> },
    { path: "/settings", element: <Navigate to="/settings/account" /> },
    { path: "/settings/account", element: <AccountSettings /> },
    { path: "/settings/workspaces", element: <WorkspaceList /> },
    { path: "/settings/workspaces/:workspaceId", element: <WorkspaceSettings /> },
    { path: "/settings/workspaces/:workspaceId/projects", element: <SettingsProjectList /> },
    { path: "/settings/workspaces/:workspaceId/asset", element: <AssetSettings /> },
    { path: "/settings/projects/:projectId", element: <ProjectSettings /> },
    { path: "/settings/projects/:projectId/public", element: <PublicSettings /> },
    { path: "/settings/projects/:projectId/dataset", element: <DatasetSettings /> },
    { path: "/settings/projects/:projectId/plugins", element: <PluginSettings /> },
    { path: "/plugin-editor", element: <PluginEditor /> },
    { path: "/graphql", element: import.meta.env.DEV && <GraphQLPlayground /> },
    ...redirects,
    { path: "*", element: <NotFound /> },
  ]);
}

export default function App() {
  return (
    <Auth0Provider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading />}>
              <NotificationBanner />
              <StyledRouter>
                <AppRoutes />
              </StyledRouter>
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </GqlProvider>
    </Auth0Provider>
  );
}

const StyledRouter = styled(Router)`
  height: 100%;
`;

// Redirections for breaking changes in URLs
const redirects = [
  ["/settings/workspace/:workspaceId", "/settings/workspaces/:workspaceId"],
  ["/settings/workspace/:workspaceId/projects", "/settings/workspaces/:workspaceId/projects"],
  ["/settings/workspace/:workspaceId/asset", "/settings/workspaces/:workspaceId/asset"],
  ["/settings/project/:projectId", "/settings/projects/:projectId"],
  ["/settings/project/:projectId/public", "/settings/projects/:projectId/public"],
  ["/settings/project/:projectId/dataset", "/settings/projects/:projectId/dataset"],
  ["/settings/project/:projectId/plugins", "/settings/projects/:projectId/plugins"],
].map(([from, to]) => ({
  path: from,
  element: <Redirect to={to} />,
}));

function Redirect({ to }: { to: string }) {
  const { teamId, projectId } = useParams();
  return (
    <Navigate
      to={`${to.replace(":teamId", teamId ?? "").replace(":projectId", projectId ?? "")}`}
    />
  );
}
