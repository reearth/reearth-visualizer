import { describe, it, expect } from "vitest";

import { withWorkspaceHeader } from "./workspaceLink";

describe("withWorkspaceHeader", () => {
  it("adds the current workspace to the headers", () => {
    expect(withWorkspaceHeader({ lang: "en" }, "ws-1")).toEqual({
      lang: "en",
      "X-Workspace-Id": "ws-1"
    });
  });

  it("leaves the headers unchanged when no workspace is selected", () => {
    expect(withWorkspaceHeader({ lang: "en" }, undefined)).toEqual({
      lang: "en"
    });
  });
});
