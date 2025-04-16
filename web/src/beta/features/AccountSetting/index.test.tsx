import { render, screen } from "@reearth/test/utils";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

import AccountSetting from "./index";

vi.mock("@reearth/beta/hooks/useAccountSettingsTabs", () => ({
  default: () => ({ tabs: [] })
}));

vi.mock("@reearth/services/state", () => ({
  useWorkspace: () => [{ id: "workspace-id" }]
}));

describe("AccountSetting", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <AccountSetting />
      </MemoryRouter>
    );

    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
  });
});
