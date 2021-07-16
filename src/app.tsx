import React, { Suspense } from "react";
import { Router, Redirect } from "@reach/router";
import { LocationProvider } from "@reach/router";
import { createBrowserHistory } from "history";
import { reachify } from "redux-first-history";

import { Provider as ThemeProvider, styled } from "./theme";
import { Provider as GqlProvider } from "./gql";
import { Provider as LocalStateProvider } from "./state";
import { Provider as DndProvider } from "./util/use-dnd";
import { Provider as Auth0Provider } from "./auth";
import { Provider as IntlProvider } from "@reearth/locale";

import NotFound from "@reearth/components/pages/NotFound";
import Loading from "@reearth/components/atoms/Loading";
import TopPage from "@reearth/components/pages/TopPage";
import AccountSettings from "@reearth/components/pages/Settings/Account";
import WorkspaceSettings from "@reearth/components/pages/Settings/Workspace";
import AssetSettings from "@reearth/components/pages/Settings/Workspace/Asset";
import ProjectSettings from "@reearth/components/pages/Settings/Project";
import SettingsProjectList from "@reearth/components/pages/Settings/ProjectList";
import WorkspaceList from "@reearth/components/pages/Settings/WorkspaceList";
import PublicSettings from "@reearth/components/pages/Settings/Project/Public";
import DatasetSettings from "@reearth/components/pages/Settings/Project/Dataset";
import PluginSettings from "@reearth/components/pages/Settings/Project/Plugin";
import Preview from "./components/pages/Preview";

const enableWhyDidYouRender = false;

if (enableWhyDidYouRender && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

const EarthEditor = React.lazy(() => import("@reearth/components/pages/EarthEditor"));
const Dashboard = React.lazy(() => import("@reearth/components/pages/Dashboard"));

const history = createBrowserHistory();
const reachHistory = reachify(history);

const App: React.FC = () => {
  return (
    <Auth0Provider>
      <ThemeProvider>
        <LocalStateProvider>
          <GqlProvider>
            <LocationProvider history={reachHistory}>
              <DndProvider>
                <IntlProvider>
                  <Suspense fallback={<Loading />}>
                    <StyledRouter>
                      <TopPage path="/" />
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
                      <NotFound default />
                    </StyledRouter>
                  </Suspense>
                </IntlProvider>
              </DndProvider>
            </LocationProvider>
          </GqlProvider>
        </LocalStateProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
};

const StyledRouter = styled(Router)`
  height: 100%;
`;

export default App;
