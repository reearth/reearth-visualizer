import { fireEvent, render, screen } from "@reearth/test/utils";
import { expect, test, describe, vi } from "vitest";

import { BreadcrumbItem, Breadcrumb } from ".";

describe("Breadcrumb Component", () => {
  test("renders breadcrumb items with separator", () => {
    const items: BreadcrumbItem[] = [
      { title: "Home", id: "home", icon: "home" },
      { title: "Library", id: "library" },
      { title: "Data", id: "data" }
    ];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
  });

  test("calls onClick callback when an item is clicked", () => {
    const items: BreadcrumbItem[] = [
      { title: "Home", id: "home" },
      { title: "About", id: "about" }
    ];
    const handleClick = vi.fn();
    render(<Breadcrumb items={items} onClick={handleClick} />);
    fireEvent.click(screen.getByText("About"));
    expect(handleClick).toHaveBeenCalledWith("about");
  });

  test("renders custom separator", () => {
    const items: BreadcrumbItem[] = [
      { title: "First", id: "first" },
      { title: "Second", id: "second" }
    ];
    render(<Breadcrumb items={items} separator=">" />);
    expect(screen.getByText(">")).toBeInTheDocument();
    expect(screen.queryByText(" / ")).not.toBeInTheDocument();
  });

  test("renders ReactNode as title correctly", () => {
    const customTitle = <div data-testid="custom-title">Custom Node</div>;
    const items: BreadcrumbItem[] = [
      { title: customTitle, id: "custom" },
      { title: "Dashboard", id: "dashboard" }
    ];
    render(<Breadcrumb items={items} />);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  test("does not throw error if onClick is not provided", () => {
    const items: BreadcrumbItem[] = [{ title: "Only", id: "only" }];
    render(<Breadcrumb items={items} />);
    fireEvent.click(screen.getByText("Only"));
    expect(screen.getByText("Only")).toBeInTheDocument();
  });
});
