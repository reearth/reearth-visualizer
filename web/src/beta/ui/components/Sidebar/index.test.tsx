import { screen, fireEvent, render } from "@reearth/test/utils";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import { SidebarMenuItem } from "./index";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("SidebarMenuItem Component", () => {
  test("renders with text and icon", () => {
    renderWithRouter(<SidebarMenuItem text="Menu Item" icon="home" />);

    expect(screen.getByText("Menu Item")).toBeInTheDocument();
    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });

  test("renders as a link when path is provided", () => {
    renderWithRouter(<SidebarMenuItem text="Menu Item" path="/test-path" />);

    const linkElement = screen.getByText("Menu Item").closest("a");
    expect(linkElement).toHaveAttribute("href", "/test-path");
  });

  test("applies disabled styles when disabled prop is true", () => {
    renderWithRouter(<SidebarMenuItem text="Menu Item" disabled />);

    const linkElement = screen.getByText("Menu Item").closest("a");
    expect(linkElement).toHaveStyle("pointer-events: none");
  });

  test("renders tile component when provided", () => {
    renderWithRouter(
      <SidebarMenuItem text="Menu Item" tileComponent={<span>Tile</span>} />
    );

    expect(screen.getByText("Tile")).toBeInTheDocument();
  });

  test("handles click events", () => {
    const handleClick = vi.fn();
    renderWithRouter(
      <SidebarMenuItem text="Menu Item" onClick={handleClick} />
    );

    fireEvent.click(screen.getByText("Menu Item"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("renders submenu items when subItem prop is provided", () => {
    const subItems = [
      { id: "sub1", text: "Submenu 1" },
      { id: "sub2", text: "Submenu 2" }
    ];

    renderWithRouter(
      <SidebarMenuItem text="Menu Item" subItem={subItems} openSubItem />
    );

    expect(screen.getByText("Menu Item")).toBeInTheDocument();
    expect(screen.getByText("Submenu 1")).toBeInTheDocument();
    expect(screen.getByText("Submenu 2")).toBeInTheDocument();
  });

  test("toggles submenu visibility when clicked", () => {
    const subItems = [{ id: "sub1", text: "Submenu 1" }];

    renderWithRouter(<SidebarMenuItem text="Menu Item" subItem={subItems} />);

    expect(screen.queryByText("Submenu 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Menu Item"));

    expect(screen.getByText("Submenu 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Menu Item"));

    expect(screen.queryByText("Submenu 1")).not.toBeInTheDocument();
  });
});
