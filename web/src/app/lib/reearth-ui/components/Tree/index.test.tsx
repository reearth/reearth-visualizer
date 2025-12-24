import { fireEvent, render, screen } from "@reearth/test/utils";
import { expect, describe, it, vi } from "vitest";

import { Tree, TreeNode } from ".";

const sampleTreeData: TreeNode[] = [
  {
    id: "1",
    label: "Parent",
    children: [
      {
        id: "1-1",
        label: "Child 1",
      },
      {
        id: "1-2", 
        label: "Child 2",
      }
    ]
  },
  {
    id: "2",
    label: "Leaf Node"
  }
];

describe("Tree Component", () => {
  it("renders tree with default props", () => {
    render(<Tree data={sampleTreeData} />);
    
    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Leaf Node")).toBeInTheDocument();
    // Children should be hidden by default
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Child 2")).not.toBeInTheDocument();
  });

  it("expands and collapses nodes on click", () => {
    render(<Tree data={sampleTreeData} />);
    
    const parentNode = screen.getByText("Parent");
    
    // Initially collapsed
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(parentNode);
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(parentNode);
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Child 2")).not.toBeInTheDocument();
  });

  it("renders with defaultExpanded", () => {
    render(<Tree data={sampleTreeData} defaultExpanded />);
    
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("calls onExpand callback when expanding nodes", () => {
    const onExpand = vi.fn();
    render(<Tree data={sampleTreeData} onExpand={onExpand} />);
    
    const parentNode = screen.getByText("Parent");
    fireEvent.click(parentNode);
    
    expect(onExpand).toHaveBeenCalledWith(["1"]);
  });

  it("selects leaf nodes when clicked", () => {
    const onSelect = vi.fn();
    render(<Tree data={sampleTreeData} onSelect={onSelect} defaultExpanded />);
    
    const leafNode = screen.getByText("Child 1");
    fireEvent.click(leafNode);
    
    expect(onSelect).toHaveBeenCalledWith("1-1", expect.objectContaining({ id: "1-1" }));
  });

  it("toggles selection when clicking same node twice", () => {
    const onSelect = vi.fn();
    render(<Tree data={sampleTreeData} onSelect={onSelect} defaultExpanded />);
    
    const leafNode = screen.getByText("Child 1");
    
    // First click selects
    fireEvent.click(leafNode);
    expect(onSelect).toHaveBeenCalledWith("1-1", expect.objectContaining({ id: "1-1" }));
    
    // Second click deselects
    fireEvent.click(leafNode);
    expect(onSelect).toHaveBeenCalledWith(null, null);
  });

  it("does not select when selectable is false", () => {
    const onSelect = vi.fn();
    render(<Tree data={sampleTreeData} onSelect={onSelect} selectable={false} defaultExpanded />);
    
    const leafNode = screen.getByText("Child 1");
    fireEvent.click(leafNode);
    
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("handles disabled nodes", () => {
    const disabledData: TreeNode[] = [
      {
        id: "1",
        label: "Disabled Node",
        disabled: true
      }
    ];
    
    const onSelect = vi.fn();
    render(<Tree data={disabledData} onSelect={onSelect} />);
    
    const disabledNode = screen.getByText("Disabled Node");
    fireEvent.click(disabledNode);
    
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders with custom icons", () => {
    const dataWithIcons: TreeNode[] = [
      {
        id: "1",
        label: "Folder",
        icon: "folderSimple",
        children: [
          {
            id: "1-1",
            label: "File",
            icon: "file"
          }
        ]
      }
    ];
    
    render(<Tree data={dataWithIcons} showIcons />);
    
    expect(screen.getByText("Folder")).toBeInTheDocument();
  });

  it("uses default expand icon for folders without custom icons", () => {
    const dataWithoutIcons: TreeNode[] = [
      {
        id: "1",
        label: "Folder",
        children: [
          {
            id: "1-1",
            label: "File"
          }
        ]
      }
    ];
    
    render(<Tree data={dataWithoutIcons} defaultExpandIcon="caretDown" />);
    
    expect(screen.getByText("Folder")).toBeInTheDocument();
  });

  it("hides icons when showIcons is false", () => {
    const dataWithIcons: TreeNode[] = [
      {
        id: "1",
        label: "Folder",
        icon: "folderSimple"
      }
    ];
    
    render(<Tree data={dataWithIcons} showIcons={false} />);
    
    expect(screen.getByText("Folder")).toBeInTheDocument();
    // Note: Icon testing would need specific icon test implementation
  });

  it("uses controlled selectedId", () => {
    const onSelect = vi.fn();
    render(
      <Tree 
        data={sampleTreeData} 
        selectedId="1-1"
        onSelect={onSelect}
        defaultExpanded 
      />
    );
    
    // The component should use the provided selectedId
    const child2 = screen.getByText("Child 2");
    fireEvent.click(child2);
    
    expect(onSelect).toHaveBeenCalledWith("1-2", expect.objectContaining({ id: "1-2" }));
  });

  it("uses controlled expandedIds", () => {
    render(
      <Tree 
        data={sampleTreeData} 
        expandedIds={["1"]}
      />
    );
    
    // Children should be visible because parent is in expandedIds
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("calls onNodeClick callback", () => {
    const onNodeClick = vi.fn();
    render(<Tree data={sampleTreeData} onNodeClick={onNodeClick} />);
    
    const parentNode = screen.getByText("Parent");
    fireEvent.click(parentNode);
    
    expect(onNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", label: "Parent" }),
      true
    );
  });


  it("renders with custom data-testid", () => {
    render(<Tree data={sampleTreeData} data-testid="custom-tree" />);
    
    expect(screen.getByTestId("custom-tree")).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<Tree data={[]} />);
    
    // Should render without errors
    expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
  });

  it("supports async loading of children", async () => {
    const asyncData: TreeNode[] = [
      {
        id: "async-folder",
        label: "Async Folder",
        hasChildren: true
      }
    ];

    const onLoadChildren = vi.fn().mockResolvedValue([
      { id: "child-1", label: "Async Child 1" },
      { id: "child-2", label: "Async Child 2" }
    ]);

    render(
      <Tree 
        data={asyncData} 
        onLoadChildren={onLoadChildren}
      />
    );

    const folderNode = screen.getByText("Async Folder");
    
    // Initially children should not be visible
    expect(screen.queryByText("Async Child 1")).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(folderNode);
    
    // onLoadChildren should be called
    expect(onLoadChildren).toHaveBeenCalledWith(
      expect.objectContaining({ id: "async-folder" })
    );

    // Wait for children to load and appear
    await screen.findByText("Async Child 1");
    expect(screen.getByText("Async Child 2")).toBeInTheDocument();
  });

  it("shows loading state during async operation", async () => {
    const asyncData: TreeNode[] = [
      {
        id: "async-folder",
        label: "Async Folder", 
        hasChildren: true
      }
    ];

    // Create a promise that we can control
    let resolveLoad: (children: TreeNode[]) => void = () => {};
    const loadPromise = new Promise<TreeNode[]>((resolve) => {
      resolveLoad = resolve;
    });

    const onLoadChildren = vi.fn().mockReturnValue(loadPromise);

    render(
      <Tree 
        data={asyncData} 
        onLoadChildren={onLoadChildren}
      />
    );

    const folderNode = screen.getByText("Async Folder");
    
    // Click to expand
    fireEvent.click(folderNode);
    
    // Should show loading state (loading icon should be present)
    expect(onLoadChildren).toHaveBeenCalled();
    
    // Resolve the loading
    resolveLoad([{ id: "child-1", label: "Loaded Child" }]);
    
    // Wait for child to appear
    await screen.findByText("Loaded Child");
  });
});