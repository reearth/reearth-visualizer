import { lazy } from "react";

export const NotFound = lazy(() => import("@reearth/beta/components/NotFound"));
export const BetaEditor = lazy(() => import("@reearth/beta/pages/EditorPage"));
export const LoginPage = lazy(
  () => import("@reearth/classic/components/pages/Authentication/LoginPage"),
);
export const PasswordResetPage = lazy(
  () => import("@reearth/classic/components/pages/Authentication/PasswordReset"),
);
export const SignupPage = lazy(
  () => import("@reearth/classic/components/pages/Authentication/SignupPage"),
);
export const AccountSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Account"),
);
export const ProjectSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Project"),
);
export const DatasetSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Project/Dataset"),
);
export const PluginSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Project/Plugin"),
);
export const PublicSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Project/Public"),
);
export const SettingsProjectList = lazy(
  () => import("@reearth/classic/components/pages/Settings/ProjectList"),
);
export const WorkspaceSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Workspace"),
);
export const AssetSettings = lazy(
  () => import("@reearth/classic/components/pages/Settings/Workspace/Asset"),
);
export const WorkspaceList = lazy(
  () => import("@reearth/classic/components/pages/Settings/WorkspaceList"),
);
export const RootPage = lazy(
  () => import("../../classic/components/pages/Authentication/RootPage"),
);
export const Preview = lazy(() => import("../../classic/components/pages/Preview"));

export const BetaProjectSettings = lazy(() => import("@reearth/beta/pages/ProjectSettingsPage"));

export const EarthEditor = lazy(() => import("@reearth/classic/components/pages/EarthEditor"));
export const Dashboard = lazy(() => import("@reearth/classic/components/pages/Dashboard"));
export const GraphQLPlayground = lazy(() => import("@reearth/beta/pages/GraphQLPlayground"));
export const PluginEditor = lazy(() => import("../../classic/components/pages/PluginEditor"));
