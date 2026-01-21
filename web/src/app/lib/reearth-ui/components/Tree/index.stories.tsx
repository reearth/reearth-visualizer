import { Meta, StoryObj } from "@storybook/react-vite";

import { Tree, TreeProps, TreeNode } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<TreeProps> = {
  component: Tree
};

export default meta;
type Story = StoryObj<TreeProps>;

const sampleTreeData: TreeNode[] = [
  {
    id: "1",
    label: "Root Folder",
    icon: "folderSimple",
    children: [
      {
        id: "1-1",
        label: "Documents",
        icon: "folderSimple",
        children: [
          {
            id: "1-1-1",
            label: "document1.pdf",
            icon: "file"
          },
          {
            id: "1-1-2", 
            label: "document2.docx",
            icon: "file"
          }
        ]
      },
      {
        id: "1-2",
        label: "Images",
        icon: "folderSimple",
        children: [
          {
            id: "1-2-1",
            label: "photo1.jpg",
            icon: "image"
          },
          {
            id: "1-2-2",
            label: "photo2.png", 
            icon: "image"
          }
        ]
      },
      {
        id: "1-3",
        label: "readme.txt",
        icon: "file"
      }
    ]
  },
  {
    id: "2",
    label: "Projects",
    icon: "folderSimple", 
    children: [
      {
        id: "2-1",
        label: "Project A",
        icon: "folderSimple",
        children: [
          {
            id: "2-1-1",
            label: "index.js",
            icon: "fileHtml"
          },
          {
            id: "2-1-2",
            label: "package.json",
            icon: "file"
          }
        ]
      },
      {
        id: "2-2",
        label: "Project B", 
        icon: "folderSimple",
        disabled: true,
        children: [
          {
            id: "2-2-1",
            label: "app.py",
            icon: "fileHtml"
          }
        ]
      }
    ]
  },
  {
    id: "3",
    label: "temp.log",
    icon: "file"
  }
];

export const Default: Story = {
  args: {
    data: sampleTreeData,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

export const DefaultExpanded: Story = {
  args: {
    data: sampleTreeData,
    defaultExpanded: true,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

export const WithSelection: Story = {
  args: {
    data: sampleTreeData,
    selectedId: "1-1-1",
    defaultExpanded: true,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};


export const WithoutIcons: Story = {
  args: {
    data: sampleTreeData,
    showIcons: false,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

export const DefaultExpandIcon: Story = {
  args: {
    data: [
      {
        id: "1",
        label: "Folder without custom icon",
        children: [
          { id: "1-1", label: "Child 1" },
          { id: "1-2", label: "Child 2" }
        ]
      },
      {
        id: "2", 
        label: "File without icon"
      }
    ],
    defaultExpanded: true,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

export const NonSelectable: Story = {
  args: {
    data: sampleTreeData,
    selectable: false,
    onExpand: fn(),
    onNodeClick: fn()
  }
};

export const ControlledExpansion: Story = {
  args: {
    data: sampleTreeData,
    expandedIds: ["1", "1-1"],
    selectedId: "1-1-1",
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

const flatTreeData: TreeNode[] = [
  {
    id: "flat1",
    label: "Item 1",
    icon: "file"
  },
  {
    id: "flat2", 
    label: "Item 2",
    icon: "file"
  },
  {
    id: "flat3",
    label: "Item 3",
    icon: "file"
  }
];

export const FlatList: Story = {
  args: {
    data: flatTreeData,
    onSelect: fn(),
    onNodeClick: fn()
  }
};

const deepTreeData: TreeNode[] = [
  {
    id: "deep1",
    label: "Level 1",
    icon: "folderSimple",
    children: [
      {
        id: "deep1-1",
        label: "Level 2",
        icon: "folderSimple",
        children: [
          {
            id: "deep1-1-1",
            label: "Level 3",
            icon: "folderSimple",
            children: [
              {
                id: "deep1-1-1-1",
                label: "Level 4",
                icon: "folderSimple",
                children: [
                  {
                    id: "deep1-1-1-1-1",
                    label: "Deep file",
                    icon: "file"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const DeepNesting: Story = {
  args: {
    data: deepTreeData,
    defaultExpanded: true,
    onSelect: fn(),
    onExpand: fn(),
    onNodeClick: fn()
  }
};

const asyncTreeData: TreeNode[] = [
  {
    id: "async-1",
    label: "Async Folder",
    icon: "folderSimple",
    hasChildren: true // Indicates children can be loaded
  },
  {
    id: "async-2",
    label: "Another Async Folder",
    icon: "folderSimple", 
    hasChildren: true
  },
  {
    id: "static-file",
    label: "Static File",
    icon: "file"
  }
];

// Mock async data
const mockAsyncChildren: Record<string, TreeNode[]> = {
  "async-1": [
    { id: "async-1-1", label: "Loaded Child 1", icon: "file" },
    { id: "async-1-2", label: "Loaded Child 2", icon: "file" },
    { id: "async-1-3", label: "Nested Async Folder", icon: "folderSimple", hasChildren: true }
  ],
  "async-2": [
    { id: "async-2-1", label: "Another Child 1", icon: "file" },
    { id: "async-2-2", label: "Another Child 2", icon: "file" }
  ],
  "async-1-3": [
    { id: "async-1-3-1", label: "Deep Child", icon: "file" }
  ]
};

export const AsyncLoading: Story = {
  args: {
    data: asyncTreeData,
    onSelect: fn(),
    onExpand: fn(), 
    onNodeClick: fn(),
    onLoadChildren: async (node: TreeNode) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockAsyncChildren[node.id] || [];
    }
  }
};