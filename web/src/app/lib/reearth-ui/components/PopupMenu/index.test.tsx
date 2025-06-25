import { screen, fireEvent, render } from "@reearth/test/utils";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import { PopupMenu } from "./index";

const mockMenuItems = [
  {
    id: "item1",
    title: "Menu Item 1",
    icon: "check" as const
  },
  {
    id: "item2",
    title: "Menu Item 2",
    icon: "close" as const
  },
  {
    id: "item3",
    title: "Menu Item 3",
    onClick: vi.fn()
  }
];

const mockCustomSubMenuItems = [
  {
    id: "item1",
    title: "Group 1 Item 1",
    hasCustomSubMenu: true,
    customSubMenuLabel: "Group 1",
    customSubMenuOrder: 1
  },
  {
    id: "item2",
    title: "Group 1 Item 2",
    hasCustomSubMenu: true,
    customSubMenuLabel: "Group 1",
    customSubMenuOrder: 2
  },
  {
    id: "item3",
    title: "Group 2 Item 1",
    hasCustomSubMenu: true,
    customSubMenuLabel: "Group 2",
    customSubMenuOrder: 1
  }
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("PopupMenu Component", () => {
  test("renders with label", () => {
    renderWithRouter(<PopupMenu label="Menu" menu={mockMenuItems} />);

    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  test("shows menu when trigger is clicked", () => {
    renderWithRouter(<PopupMenu label="Menu" menu={mockMenuItems} />);

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    expect(screen.getByText("Menu Item 1")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 2")).toBeInTheDocument();
    expect(screen.getByText("Menu Item 3")).toBeInTheDocument();
  });

  test("calls item onClick when menu item is clicked", () => {
    const onClickMock = vi.fn();
    const menuItems = [
      {
        id: "item1",
        title: "Clickable Item",
        onClick: onClickMock
      }
    ];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    const menuItem = screen.getByText("Clickable Item");
    fireEvent.click(menuItem);

    expect(onClickMock).toHaveBeenCalledWith("item1");
  });

  test("renders with icon as trigger", () => {
    renderWithRouter(<PopupMenu icon="setting" menu={mockMenuItems} />);

    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });

  test("renders with path items as links", () => {
    const menuItems = [
      {
        id: "item1",
        title: "Link Item",
        path: "/some-path"
      }
    ];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    const linkElement = screen.getByText("Link Item").closest("a");
    expect(linkElement).toHaveAttribute("href", "/some-path");
  });

  test("renders disabled item", () => {
    const onClickMock = vi.fn();
    const menuItems = [
      {
        id: "item1",
        title: "Disabled Item",
        disabled: true,
        onClick: onClickMock
      }
    ];

    renderWithRouter(<PopupMenu label="Menu" menu={menuItems} />);

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    const menuItem = screen.getByText("Disabled Item");
    fireEvent.click(menuItem);

    expect(onClickMock).not.toHaveBeenCalled();
  });

  test("calls onOpenChange when menu opens and closes", () => {
    const onOpenChangeMock = vi.fn();
    renderWithRouter(
      <PopupMenu
        label="Menu"
        menu={mockMenuItems}
        onOpenChange={onOpenChangeMock}
      />
    );

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    expect(onOpenChangeMock).toHaveBeenCalledWith(true);

    fireEvent.click(trigger);

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

  test("renders with custom submenu groups", () => {
    renderWithRouter(
      <PopupMenu label="Menu" menu={mockCustomSubMenuItems} nested />
    );

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByText("Group 2")).toBeInTheDocument();
    expect(screen.getByText("Group 1 Item 1")).toBeInTheDocument();
    expect(screen.getByText("Group 1 Item 2")).toBeInTheDocument();
    expect(screen.getByText("Group 2 Item 1")).toBeInTheDocument();
  });

  test("renders with React Node as label", () => {
    const customLabel = <div data-testid="custom-label">Custom Label</div>;
    renderWithRouter(<PopupMenu label={customLabel} menu={mockMenuItems} />);

    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
  });
});
