import { render, screen } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import NotFound from "./index";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe("NotFound", () => {
  it("renders correctly", () => {
    render(<NotFound />);

    expect(screen.getByText("Re:Earth Visualizer")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops, Page Not Found!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to Dashboard" })
    ).toBeInTheDocument();
  });

  it("navigates to home page when button is clicked", () => {
    render(<NotFound />);

    const button = screen.getByRole("button", { name: "Go to Dashboard" });
    button.click();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
