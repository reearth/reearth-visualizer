import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, describe, beforeAll, afterAll, vi } from "vitest";

import { Tabs } from "@reearth/beta/features/Navbar";
import { render, screen } from "@reearth/test/utils";

import EditorPage from ".";

const editorText = "editorText";
const notFoundText = "Notfound";

describe("EditorPage", () => {
  beforeAll(() => {
    vi.mock("@reearth/beta/features/Editor", () => ({
      default: () => <div>{editorText}</div>,
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test("should display 404 when router params are invalid", () => {
    render(
      <MemoryRouter initialEntries={["/1/dummy"]}>
        <Routes>
          <Route path="/:sceneId/:tab" element={<EditorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.queryByText(editorText)).toBeNull();
    expect(screen.getByText(notFoundText)).toBeInTheDocument();
  });

  Tabs.map(tab => {
    test(`should display editor when tab is ${tab}`, () => {
      render(
        <MemoryRouter initialEntries={[`/1/${tab}`]}>
          <Routes>
            <Route path="/:sceneId/:tab" element={<EditorPage />} />
          </Routes>
        </MemoryRouter>,
      );
      expect(screen.queryByText(notFoundText)).toBeNull();
      expect(screen.getByText(editorText)).toBeInTheDocument();
    });
  });
});
