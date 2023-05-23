import React, { Suspense } from "react";
import { BrowserRouter as Router, Navigate, useParams, Routes, Route } from "react-router-dom";

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

export default function App() {
  return (
    <Auth0Provider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading />}>
              <NotificationBanner />
              <StyledRouter>
                <Routes>
                  <Route path="/" element={<RootPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route path="/dashboard/:workspaceId" element={<Dashboard />} />
                  <Route path="/edit/:sceneId" element={<EarthEditor />} />
                  <Route path="/edit/:sceneId/preview" element={<Preview />} />
                  <Route path="settings" element={<Navigate to="/settings/account" />} />
                  <Route path="/settings/account" element={<AccountSettings />} />
                  <Route path="/settings/workspaces" element={<WorkspaceList />} />
                  <Route path="/settings/workspaces/:workspaceId" element={<WorkspaceSettings />} />
                  <Route
                    path="/settings/workspaces/:workspaceId/projects"
                    element={<SettingsProjectList />}
                  />
                  <Route
                    path="/settings/workspaces/:workspaceId/asset"
                    element={<AssetSettings />}
                  />
                  <Route path="/settings/projects/:projectId" element={<ProjectSettings />} />
                  <Route path="/settings/projects/:projectId/public" element={<PublicSettings />} />
                  <Route
                    path="/settings/projects/:projectId/dataset"
                    element={<DatasetSettings />}
                  />
                  <Route
                    path="/settings/projects/:projectId/plugins"
                    element={<PluginSettings />}
                  />
                  <Route path="/plugin-editor" element={<PluginEditor />} />
                  <Route path="/graphql" element={<GraphQLPlayground />} />
                  {...redirects.map(([from, to]) => (
                    <Route key={from} path={from} element={<Redirect to={to} />} />
                  ))}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
];

function Redirect({ to }: { to: string }) {
  const { teamId, projectId } = useParams();
  return (
    <Navigate
      to={`${to.replace(":teamId", teamId ?? "").replace(":projectId", projectId ?? "")}`}
    />
  );
}
