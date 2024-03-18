import { lazy } from "react";
import {
  Navigate,
  Route,
  useParams,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";

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
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Beta routes - start */}
        <Route path="scene/:sceneId/:tab" element={<BetaEditor />} />
        <Route path="settings/project/:projectId/:tab?/:subId?" element={<BetaProjectSettings />} />
        <Route path="graphql" element={<GraphQLPlayground />} />
        {/* Beta routes - end */}
        {/* classic routes - start */}
        <Route index={true} element={<RootPage />} />
        <Route path="auth/*" element={<RootPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="password-reset" element={<PasswordResetPage />} />
        <Route path="dashboard" element={<Dashboard />} />
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
        {/* classic routes - end */}
        <Route path="*" element={<NotFound />} />
      </>,
    ),
  );
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
