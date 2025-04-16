import {
  MockedProvider as MockedGqlProvider,
  MockedResponse
} from "@apollo/client/testing";
import { render as rtlRender } from "@testing-library/react";
import { vitest } from "vitest";

import { Provider as I18nProvider } from "../services/i18n";
import { Provider as ThemeProvider } from "../services/theme";

// react-inlinesvg is not displayed in test.
// see detail: https://github.com/gilbarbara/react-inlinesvg/issues/145
vitest.mock("react-inlinesvg", () => {
  return {
    default: function InlineSvgMock(props: {
      "aria-label"?: string;
      style?: React.CSSProperties;
      size?: number | string;
    }) {
      return (
        <svg
          aria-label={props["aria-label"]}
          style={props.style}
          width={props.size}
          height={props.size}
        />
      );
    }
  };
});

vitest.mock("@reearth/services/i18n", () => ({
  useT: () => (key: string) => key,
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vitest.mock("@reearth/services/state", () => ({
  useAddWorkspaceModal: () => [false, vitest.fn()],
  useHasActiveGQLTasks: () => [false],
  useNotification: () => [null, vitest.fn()],
  useTransition: () => [false, vitest.fn()],
  useProjectId: () => ["project-id", vitest.fn()],
  useWorkspace: () => [{ id: "workspace-id" }],
  useCurrentTheme: () => [undefined, vitest.fn()],
  useDevPluginExtensions: () => [undefined],
  useDevPluginExtensionRenderKey: () => [undefined, vitest.fn()]
}));

vitest.mock("@reearth/beta/ui/fields/CommonField", () => ({
  default: ({
    children,
    title,
    description
  }: {
    children?: React.ReactNode;
    title?: string;
    description?: string;
  }) => (
    <div data-testid="common-field">
      {title && <div data-testid="field-title">{title}</div>}
      {description && <div data-testid="field-description">{description}</div>}
      {children}
    </div>
  )
}));

vitest.mock("@reearth/services/theme", async (importOriginal) => {
  const actual = await importOriginal();

  return actual;
});

vitest.mock("@reearth/services/api", () => ({
  useWorkspaceFetcher: () => ({
    useCreateWorkspace: vitest.fn().mockResolvedValue({
      data: { id: "mockWorkspaceId" }
    }),
    useWorkspacesQuery: vitest.fn().mockReturnValue({
      workspaces: [{ name: "Workspace1" }, { name: "Workspace2" }]
    }),
    useWorkspaceQuery: vitest.fn().mockReturnValue({
      workspaces: [{ id: "mockWorkspaceId", name: "Mock Workspace" }]
    })
  }),
  useMeFetcher: () => ({
    useMeQuery: vitest.fn().mockReturnValue({
      me: { theme: "light" }
    })
  }),
  useProjectFetcher: () => ({
    useProjectQuery: vitest.fn().mockReturnValue({
      project: { id: "mockProjectId", name: "Mock Project" }
    }),
    useStarredProjectsQuery: vitest.fn().mockReturnValue({
      starredProjects: [
        { id: "mockStarredProjectId", name: "Mock Starred Project" }
      ]
    }),
    useProjectsQuery: vitest.fn().mockReturnValue({
      projects: [
        { id: "mockProjectId1", name: "Mock Project 1" },
        { id: "mockProjectId2", name: "Mock Project 2" }
      ]
    })
  }),
  useStorytellingFetcher: () => ({
    useStoriesQuery: vitest.fn().mockReturnValue({
      stories: [
        { id: "mockStoryId1", name: "Mock Story 1" },
        { id: "mockStoryId2", name: "Mock Story 2" }
      ]
    }),
    usePublishQuery: vitest.fn().mockReturnValue({
      publish: {
        id: "mockPublishId",
        name: "Mock Publish",
        description: "Mock Publish Description",
        thumbnail: "mockThumbnailUrl",
        url: "mockPublishUrl"
      }
    })
  }),
  usePluginsFetcher: () => ({
    usePluginsQuery: vitest.fn().mockReturnValue({
      plugins: [
        {
          id: "mockPluginId1",
          name: "Mock Plugin 1",
          description: "Mock Plugin 1 Description",
          version: "1.0.0",
          iconUrl: "mockIconUrl1"
        },
        {
          id: "mockPluginId2",
          name: "Mock Plugin 2",
          description: "Mock Plugin 2 Description",
          version: "2.0.0",
          iconUrl: "mockIconUrl2"
        }
      ]
    })
  })
}));
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

const render = (
  ui: React.ReactElement,
  queryMocks?: readonly MockedResponse<Record<string, unknown>>[],
  { ...renderOptions } = {}
) => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <MockedGqlProvider mocks={queryMocks} addTypename={false}>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </MockedGqlProvider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";

export { render };
