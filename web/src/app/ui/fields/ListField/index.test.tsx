import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ListField, { ListItemProps } from "./index";

describe("ListField", () => {
  it("renders ListField and adds a new item", () => {
    const mockOnItemAdd = vi.fn();
    const mockItems: ListItemProps[] = [
      { id: "1", title: "Item 1" },
      { id: "2", title: "Item 2" }
    ];

    render(
      <ThemeProvider theme={darkTheme}>
        <ListField
          title="Test List"
          description="Test Description"
          items={mockItems}
          onItemAdd={mockOnItemAdd}
          showTitle
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Test List")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const addButton = screen.getByText("New Item");
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);

    expect(mockOnItemAdd).toHaveBeenCalled();
  });

  it("allows renaming items when isEditable is true", () => {
    const mockOnItemAdd = vi.fn();
    const mockOnItemNameUpdate = vi.fn();
    const mockItems: ListItemProps[] = [
      { id: "1", title: "Item 1" },
      { id: "2", title: "Item 2" }
    ];

    render(
      <ThemeProvider theme={darkTheme}>
        <ListField
          title="Test List"
          description="Test Description"
          items={mockItems}
          isEditable
          onItemAdd={mockOnItemAdd}
          onItemNameUpdate={mockOnItemNameUpdate}
        />
      </ThemeProvider>
    );

    const itemTitle = screen.getByText("Item 1");
    fireEvent.doubleClick(itemTitle);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Item 1" } });
    fireEvent.blur(input);

    expect(mockOnItemNameUpdate).toHaveBeenCalledWith("1", "Updated Item 1");
  });
});
