import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { EntryItem } from "./index";

describe("EntryItem Component", () => {
  test("renders title correctly", () => {
    render(<EntryItem title="Test Item" />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  test("renders with icon when provided", () => {
    render(<EntryItem title="Test Item" icon="book" />);

    const iconElement = document.querySelector("svg");
    expect(iconElement).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<EntryItem title="Test Item" onClick={handleClick} />);

    const entryItem = screen.getByText("Test Item").closest("div");
    fireEvent.click(entryItem as HTMLElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("shows options menu when provided", () => {
    const optionsMenu = [
      { id: "option1", title: "Option 1" },
      { id: "option2", title: "Option 2" }
    ];

    render(<EntryItem title="Test Item" optionsMenu={optionsMenu} />);

    const optionsButton = screen.getByTestId("options-wrapper");
    expect(optionsButton).toBeInTheDocument();
  });

  test("applies highlighted style when highlighted prop is true", () => {
    const { container } = render(<EntryItem title="Test Item" highlighted />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle("background-color: rgb(59, 60, 208)");
  });
});
