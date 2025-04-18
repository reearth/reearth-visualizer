import { render, screen, fireEvent } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import DragAndDropList from "./index";

vi.mock("react-sortablejs", () => ({
  ReactSortable: ({
    children,
    onStart,
    onEnd,
    setList
  }: {
    children: React.ReactNode;
    onStart?: () => void;
    onEnd?: (event: {
      item: { dataset: { id: string } };
      newIndex: number;
    }) => void;
    setList: (
      list: { id: string; content: string }[],
      arg1: null,
      arg2: null
    ) => void;
  }) => {
    return (
      <div
        data-testid="react-sortable"
        onDragStart={() => onStart?.()}
        onDragEnd={(_) => {
          // Mock SortableEvent
          const mockEvent = {
            item: { dataset: { id: "item1" } },
            newIndex: 1
          };
          onEnd?.(mockEvent);
        }}
      >
        {children}
        <button
          data-testid="trigger-set-list"
          style={{ display: "none" }}
          onClick={() =>
            setList([{ id: "item1", content: "Updated Item 1" }], null, null)
          }
        />
      </div>
    );
  }
}));

describe("DragAndDropList Component", () => {
  const mockItems = [
    { id: "item1", content: <div>Item 1</div> },
    { id: "item2", content: <div>Item 2</div> }
  ];

  const mockSetItems = vi.fn();
  const mockOnMoveStart = vi.fn();
  const mockOnMoveEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders list items correctly", () => {
    render(<DragAndDropList items={mockItems} setItems={mockSetItems} />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    expect(screen.getByTestId("react-sortable")).toBeInTheDocument();
  });

  test("calls setItems when list changes", () => {
    render(<DragAndDropList items={mockItems} setItems={mockSetItems} />);

    fireEvent.click(screen.getByTestId("trigger-set-list"));

    expect(mockSetItems).toHaveBeenCalledTimes(1);
    expect(mockSetItems).toHaveBeenCalledWith([
      { id: "item1", content: "Updated Item 1" }
    ]);
  });

  test("calls onMoveStart when dragging starts", () => {
    render(
      <DragAndDropList
        items={mockItems}
        setItems={mockSetItems}
        onMoveStart={mockOnMoveStart}
      />
    );

    fireEvent.dragStart(screen.getByTestId("react-sortable"));

    expect(mockOnMoveStart).toHaveBeenCalledTimes(1);
  });

  test("calls onMoveEnd when dragging ends", () => {
    render(
      <DragAndDropList
        items={mockItems}
        setItems={mockSetItems}
        onMoveEnd={mockOnMoveEnd}
      />
    );

    fireEvent.dragEnd(screen.getByTestId("react-sortable"));

    expect(mockOnMoveEnd).toHaveBeenCalledTimes(1);
    expect(mockOnMoveEnd).toHaveBeenCalledWith("item1", 1);
  });

  test("renders empty list when no items are provided", () => {
    render(<DragAndDropList items={[]} setItems={mockSetItems} />);

    const sortableContainer = screen.getByTestId("react-sortable");
    expect(sortableContainer.children.length).toBe(1); // Only has the hidden test button
  });
});
