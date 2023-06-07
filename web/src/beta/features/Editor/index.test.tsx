import { MemoryRouter } from "react-router-dom";
import { expect, test, describe, beforeAll, afterAll, vi } from "vitest";

import { Tabs } from "@reearth/beta/features/Navbar";
import { render } from "@reearth/test/utils";

import EditorPage from ".";

const visualizerText = "visualizerText";

describe("EditorPage", () => {
  beforeAll(() => {
    vi.mock("@reearth/beta/features/Visualizer", () => ({
      default: () => <div>{visualizerText}</div>,
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  Tabs.map(tab => {
    test(`should display editor when tab is ${tab}`, () => {
      const { container } = render(
        <MemoryRouter>
          <EditorPage sceneId="dummy" tab={tab} />
        </MemoryRouter>,
      );
      expect(container.children.length).toBe(1);
    });
  });
});
