import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { TabItem, Tabs } from "./index";

describe("Tabs Component", () => {
  const tabsData = [
    { id: "tab1", name: "Tab 1", children: <div>Tab 1 content</div> },
    { id: "tab2", name: "Tab 2", children: <div>Tab 2 content</div> },
    { id: "tab3", name: "Tab 3", children: <div>Tab 3 content</div> }
  ];

  test("renders tabs and shows first tab content by default", () => {
    render(<Tabs tabs={tabsData} />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();

    expect(screen.getByText("Tab 1 content")).toBeInTheDocument();
    expect(screen.queryByText("Tab 2 content")).not.toBeInTheDocument();
    expect(screen.queryByText("Tab 3 content")).not.toBeInTheDocument();
  });

  test("changes active tab when tab is clicked", () => {
    render(<Tabs tabs={tabsData} />);

    fireEvent.click(screen.getByText("Tab 2"));

    expect(screen.queryByText("Tab 1 content")).not.toBeInTheDocument();
    expect(screen.getByText("Tab 2 content")).toBeInTheDocument();
    expect(screen.queryByText("Tab 3 content")).not.toBeInTheDocument();
  });

  test("renders the specified current tab", () => {
    render(<Tabs tabs={tabsData} currentTab="tab3" />);

    expect(screen.queryByText("Tab 1 content")).not.toBeInTheDocument();
    expect(screen.queryByText("Tab 2 content")).not.toBeInTheDocument();
    expect(screen.getByText("Tab 3 content")).toBeInTheDocument();
  });

  test("calls onChange when tab is clicked", () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} onChange={handleChange} />);

    fireEvent.click(screen.getByText("Tab 2"));

    expect(handleChange).toHaveBeenCalledWith("tab2");
  });

  test("updates active tab when currentTab prop changes", () => {
    const { rerender } = render(<Tabs tabs={tabsData} currentTab="tab1" />);

    expect(screen.getByText("Tab 1 content")).toBeInTheDocument();

    rerender(<Tabs tabs={tabsData} currentTab="tab3" />);

    expect(screen.queryByText("Tab 1 content")).not.toBeInTheDocument();
    expect(screen.getByText("Tab 3 content")).toBeInTheDocument();
  });

  test("renders tabs with icons", () => {
    const tabsWithIcons = [
      {
        id: "tab1",
        name: "Tab 1",
        icon: "home",
        children: <div>Tab 1 content</div>
      },
      {
        id: "tab2",
        name: "Tab 2",
        icon: "book",
        children: <div>Tab 2 content</div>
      }
    ] as TabItem[];

    render(<Tabs tabs={tabsWithIcons} />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();

    const iconElements = document.querySelectorAll("svg");
    expect(iconElements.length).toBe(2);
  });
});
