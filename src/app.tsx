import { Router, Redirect } from "@reach/router";
import React, { Suspense } from "react";

import Loading from "@reearth/components/atoms/Loading";
import NotificationBanner from "@reearth/components/organisms/Notification";
import LoginPage from "@reearth/components/pages/Authentication/LoginPage";
import PasswordResetPage from "@reearth/components/pages/Authentication/PasswordReset";
import SignupPage from "@reearth/components/pages/Authentication/SignupPage";
import NotFound from "@reearth/components/pages/NotFound";
import AccountSettings from "@reearth/components/pages/Settings/Account";
import ProjectSettings from "@reearth/components/pages/Settings/Project";
import DatasetSettings from "@reearth/components/pages/Settings/Project/Dataset";
import PluginSettings from "@reearth/components/pages/Settings/Project/Plugin";
import PublicSettings from "@reearth/components/pages/Settings/Project/Public";
import SettingsProjectList from "@reearth/components/pages/Settings/ProjectList";
import WorkspaceSettings from "@reearth/components/pages/Settings/Workspace";
import AssetSettings from "@reearth/components/pages/Settings/Workspace/Asset";
import WorkspaceList from "@reearth/components/pages/Settings/WorkspaceList";
import { Provider as I18nProvider } from "@reearth/i18n";

import { Provider as Auth0Provider } from "./auth";
import RootPage from "./components/pages/Authentication/RootPage";
import Preview from "./components/pages/Preview";
import { Provider as GqlProvider } from "./gql";
import { Provider as ThemeProvider, styled } from "./theme";

const EarthEditor = React.lazy(() => import("@reearth/components/pages/EarthEditor"));
const Dashboard = React.lazy(() => import("@reearth/components/pages/Dashboard"));
const GraphQLPlayground = React.lazy(() => import("@reearth/components/pages/GraphQLPlayground"));
const PluginEditor = React.lazy(() => import("./components/pages/PluginEditor"));

const enableWhyDidYouRender = false;

if (enableWhyDidYouRender && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

const App: React.FC = () => {
  return (
    <Auth0Provider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading />}>
              <NotificationBanner />
              <StyledRouter>
                <RootPage path="/" />
                <LoginPage path="/login" />
                <SignupPage path="/signup" />
                <PasswordResetPage path="/password-reset" />
                <Dashboard path="/dashboard/:teamId" />
                <EarthEditor path="/edit/:sceneId" />
                <Preview path="/edit/:sceneId/preview" />
                <Redirect from="/settings" to="/settings/account" />
                <AccountSettings path="/settings/account" />
                <WorkspaceList path="/settings/workspaces" />
                <WorkspaceSettings path="/settings/workspace/:teamId" />
                <SettingsProjectList path="/settings/workspace/:teamId/projects" />
                <AssetSettings path="/settings/workspace/:teamId/asset" />
                <ProjectSettings path="/settings/project/:projectId" />
                <PublicSettings path="/settings/project/:projectId/public" />
                <DatasetSettings path="/settings/project/:projectId/dataset" />
                <PluginSettings path="/settings/project/:projectId/plugins" />
                <PluginEditor path="/plugin-editor" />
                {process.env.NODE_ENV !== "production" && <GraphQLPlayground path="/graphql" />}
                <NotFound default />
              </StyledRouter>
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </GqlProvider>
    </Auth0Provider>
  );
};

const StyledRouter = styled(Router)`
  height: 100%;
`;

export default App;
