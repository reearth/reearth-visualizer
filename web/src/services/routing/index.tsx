import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from "react-router-dom";

import { styled } from "@reearth/services/theme";

import {
  BetaEditor,
  BetaProjectSettings,
  GraphQLPlayground,
  RootPage,
  LoginPage,
  SignupPage,
  PasswordResetPage,
  Dashboard,
  EarthEditor,
  Preview,
  PluginEditor,
  AccountSettings,
  WorkspaceList,
  WorkspaceSettings,
  SettingsProjectList,
  AssetSettings,
  ProjectSettings,
  DatasetSettings,
  PluginSettings,
  PublicSettings,
  NotFound,
} from "./lazyRoutes";

export const AppRoutes = () => {
  return (
    <>
      <StyledRouter>
        <Routes>
          {/* Beta routes - start */}
          <Route path="scene/:sceneId/:tab" element={<BetaEditor />} />
          <Route
            path="settings/project/:projectId/:tab?/:subId?"
            element={<BetaProjectSettings />}
          />
          <Route path="graphql" element={<GraphQLPlayground />} />
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
