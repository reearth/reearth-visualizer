import { lazy } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import LoginPage from "@reearth/classic/components/pages/Authentication/LoginPage";
import PasswordResetPage from "@reearth/classic/components/pages/Authentication/PasswordReset";
import SignupPage from "@reearth/classic/components/pages/Authentication/SignupPage";
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

import RootPage from "../../classic/components/pages/Authentication/RootPage";
import Preview from "../../classic/components/pages/Preview";

const BetaEditor = lazy(() => import("@reearth/beta/pages/EditorPage"));
const BetaProjectSettings = lazy(() => import("@reearth/beta/pages/ProjectSettingsPage"));

const EarthEditor = lazy(() => import("@reearth/classic/components/pages/EarthEditor"));
const Dashboard = lazy(() => import("@reearth/classic/components/pages/Dashboard"));
const GraphQLPlayground = lazy(() => import("@reearth/classic/components/pages/GraphQLPlayground"));
const PluginEditor = lazy(() => import("../../classic/components/pages/PluginEditor"));

export const AppRoutes = () => {
  return (
    <>
      {/* Beta routes - start */}
      <StyledRouter>
        <Routes>
          <Route path="scene/:sceneId/:tab" element={<BetaEditor />} />
          <Route
            path="settings/project/:projectId/:tab?/:subId?"
            element={<BetaProjectSettings />}
          />
          {/* Beta routes - end */}
          {/* classic routes - start */}
          <Route index={true} element={<RootPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="password-reset" element={<PasswordResetPage />} />
          <Route path="dashboard/:workspaceId" element={<Dashboard />} />
          <Route path="edit/:sceneId">
            <Route index={true} element={<EarthEditor />} />
            <Route path="preview" element={<Preview />} />
          </Route>
          <Route path="plugin-editor" element={<PluginEditor />} />
          <Route path="settings">
            <Route index={true} element={<Navigate to="/settings/account" />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="workspaces">
              <Route index={true} element={<WorkspaceList />} />
              <Route path=":workspaceId">
                <Route index={true} element={<WorkspaceSettings />} />
                <Route path="projects" element={<SettingsProjectList />} />
                <Route path="asset" element={<AssetSettings />} />
              </Route>
            </Route>
            <Route path="projects/:projectId">
              <Route index={true} element={<ProjectSettings />} />
              <Route path="public" element={<PublicSettings />} />
              <Route path="dataset" element={<DatasetSettings />} />
              <Route path="plugins" element={<PluginSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/settings/account" />} />
          </Route>
          <Route path="graphql" element={<GraphQLPlayground />} />
          {...redirects.map(([from, to]) => (
            <Route key={from} path={from} element={<Redirect to={to} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </StyledRouter>
      {/* classic routes - end */}
    </>
  );
};

const StyledRouter = styled(Router)`
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
