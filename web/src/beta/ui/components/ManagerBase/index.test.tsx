import { screen, render, fireEvent } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { ManagerHeader } from "./ManagerHeader";

describe("Manager Components", () => {
  describe("ManagerHeader", () => {
    test("renders when actions are given", () => {
      render(
        <ManagerHeader
          actions={[<div data-testid={"action"} key="action" />]}
        />
      );

      expect(screen.getByTestId("action")).toBeInTheDocument();
    });

    test("renders correctly when no actions are provided", () => {
      render(<ManagerHeader />);

      expect(screen.queryByTestId("action")).not.toBeInTheDocument();
    });

    test("renders delete text when enableDelete is true and selectedIds are given", () => {
      const handleLayoutChange = vi.fn();
      const selectedIds = ["item1", "item2"];
      render(
        <ManagerHeader
          enableDelete
          selectedIds={selectedIds}
          onLayoutChange={handleLayoutChange}
        />
      );

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    test("renders search input when showSearch is true", () => {
      render(<ManagerHeader showSearch searchPlaceholder="Search..." />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toBeInTheDocument();
    });

    test("does not render search input when showSearch is false", () => {
      render(<ManagerHeader showSearch={false} />);

      expect(
        screen.queryByPlaceholderText("Search...")
      ).not.toBeInTheDocument();
    });

    test("calls onSearch when Enter key is pressed in search input", () => {
      const handleSearch = vi.fn();
      render(<ManagerHeader showSearch onSearch={handleSearch} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test query" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(handleSearch).toHaveBeenCalledWith("test query");
    });

    test("renders sort selector when sortOptions are provided", () => {
      const sortOptions = [
        { value: "name", label: "Name" },
        { value: "date", label: "Date" }
      ];

      render(<ManagerHeader sortOptions={sortOptions} sortValue="name" />);

      expect(screen.getByText("Sort:")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    test("calls onSortChange when sort option is changed", () => {
      const handleSortChange = vi.fn();
      const sortOptions = [
        { value: "name", label: "Name" },
        { value: "date", label: "Date" }
      ];

      render(
        <ManagerHeader
          sortOptions={sortOptions}
          sortValue="name"
          onSortChange={handleSortChange}
        />
      );

      const selector = screen
        .getByText("Name")
        .closest('[data-testid="select-input"]');

      if (!selector) {
        throw new Error("Selector not found");
      }
      fireEvent.click(selector);

      const dateOption = screen.getByRole("option", { name: "Date" });
      fireEvent.click(dateOption);

      expect(handleSortChange).toHaveBeenCalledWith("date");
    });

    test("renders delete bar when items are selected", () => {
      render(
        <ManagerHeader
          enableDelete
          selectedIds={["item1", "item2"]}
          deleteText="Delete Items"
        />
      );

      expect(screen.getByText("Delete Items")).toBeInTheDocument();
    });
  });
});
