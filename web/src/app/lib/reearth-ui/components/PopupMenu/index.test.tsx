import { screen, fireEvent, render } from "@reearth/test/utils";
import { MemoryRouter } from "react-router";
import { describe, test, expect, vi } from "vitest";

import { PopupMenu, PopupMenuItem } from "./index";

const mockMenuItems: PopupMenuItem[] = [
  { id: "item1", title: "Menu Item 1", icon: "check" as const },
  { id: "item2", title: "Menu Item 2", icon: "close" as const },
  { id: "item3", title: "Menu Item 3", onClick: vi.fn() }
];

const mockGroupedItems: PopupMenuItem[] = [
  { id: "header-1", isHeader: true, title: "Group 1" },
  { id: "item1", title: "Group 1 Item 1" },
  { id: "item2", title: "Group 1 Item 2" },
  { id: "header-2", isHeader: true, title: "Group 2" },
  { id: "item3", title: "Group 2 Item 1" }
];

const renderWithRouter = (ui: React.ReactElement<unknown>) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("PopupMenu Component", () => {
  test("renders with label", () => {
    renderWithRouter(<PopupMenu label="Menu" menu={mockMenuItems} />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  test("shows menu when trigger is clicked", () => {
    renderWithRouter(<PopupMenu label="Menu" menu={mockMenuItems} />);
    fireEvent.click(screen.getByText("Menu"));

    expect(screen.getByText("Menu Item 1")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 2")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 3")).toBeInTheDocument();
  });

  test("calls item onClick when menu item is clicked", () => {
    const onClickMock = vi.fn();
    const menuItems = [{ id: "item1", title: "Clickable Item", onClick: onClickMock }];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);
    fireEvent.click(screen.getByText("Menu"));
    fireEvent.click(screen.getByText("Clickable Item"));

    expect(onClickMock).toHaveBeenCalledWith("item1");
  });

  test("renders with icon as trigger", () => {
    renderWithRouter(<PopupMenu icon="setting" menu={mockMenuItems} />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("renders path items as links", () => {
    const menuItems = [{ id: "item1", title: "Link Item", path: "/some-path" }];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);
    fireEvent.click(screen.getByText("Menu"));

    expect(screen.getByText("Link Item").closest("a")).toHaveAttribute("href", "/some-path");
  });

  test("does not call onClick for disabled items", () => {
    const onClickMock = vi.fn();
    const menuItems = [{ id: "item1", title: "Disabled Item", disabled: true, onClick: onClickMock }];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);
    fireEvent.click(screen.getByText("Menu"));
    fireEvent.click(screen.getByText("Disabled Item"));

    expect(onClickMock).not.toHaveBeenCalled();
  });

  test("calls onOpenChange when menu opens and closes", () => {
    const onOpenChangeMock = vi.fn();
    renderWithRouter(
      <PopupMenu label="Menu" menu={mockMenuItems} onOpenChange={onOpenChangeMock} />
    );

    fireEvent.click(screen.getByText("Menu"));
    expect(onOpenChangeMock).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByText("Menu"));
    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });

  test("renders with controlled open state", () => {
    const { rerender } = renderWithRouter(
      <PopupMenu label="Menu" menu={mockMenuItems} openMenu={false} />
    );
    expect(screen.queryByText("Menu Item 1")).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <PopupMenu label="Menu" menu={mockMenuItems} openMenu={true} />
      </MemoryRouter>
    );
    expect(screen.getByText("Menu Item 1")).toBeInTheDocument();
  });

  test("renders group headers as non-interactive labels", () => {
    renderWithRouter(<PopupMenu label="Menu" menu={mockGroupedItems} />);
    fireEvent.click(screen.getByText("Menu"));

    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByText("Group 2")).toBeInTheDocument();
    expect(screen.getByText("Group 1 Item 1")).toBeInTheDocument();
    expect(screen.getByText("Group 1 Item 2")).toBeInTheDocument();
    expect(screen.getByText("Group 2 Item 1")).toBeInTheDocument();
  });

  test("renders footer item in footer section", () => {
    const menuItems: PopupMenuItem[] = [
      { id: "item1", title: "Main Item" },
      { id: "footer1", title: "Footer Item", hasFooter: true }
    ];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);
    fireEvent.click(screen.getByText("Menu"));

    expect(screen.getByText("Main Item")).toBeInTheDocument();
    expect(screen.getByText("Footer Item")).toBeInTheDocument();
  });

  test("renders with React Node as label", () => {
    const customLabel = <div data-testid="custom-label">Custom Label</div>;
    renderWithRouter(<PopupMenu label={customLabel} menu={mockMenuItems} />);
    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
  });
});
