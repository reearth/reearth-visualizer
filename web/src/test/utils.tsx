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
  useNotification: () => [null, vitest.fn()],
  useProjectId: () => ["project-id"],
  useWorkspace: () => [{ id: "workspace-id" }],
  useCurrentTheme: () => [undefined, vitest.fn()]
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
