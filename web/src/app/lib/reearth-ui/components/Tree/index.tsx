import { styled } from "@reearth/services/theme";
import { ReactNode, useCallback, useState } from "react";

import { Icon, IconName } from "../Icon";
import { Typography } from "../Typography";

export type TreeNode<T = unknown> = {
  id: string;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  icon?: IconName;
  disabled?: boolean;
  hasChildren?: boolean; // Indicates if node has children that can be loaded
  isLoading?: boolean; // Indicates if children are currently being loaded
};

export type TreeProps<T = unknown> = {
  data: TreeNode<T>[];
  selectedId?: string;
  expandedIds?: string[];
  selectable?: boolean;
  showIcons?: boolean;
  defaultExpanded?: boolean;
  defaultExpandIcon?: IconName;
  onSelect?: (
    selectedId: string | null,
    selectedNode: TreeNode<T> | null
  ) => void;
  onExpand?: (expandedIds: string[]) => void;
  onNodeClick?: (node: TreeNode<T>, isExpanded?: boolean) => void;
  onLoadChildren?: (node: TreeNode<T>) => Promise<TreeNode<T>[]>;
  renderNode?: (node: TreeNode<T>, level: number) => ReactNode;
  className?: string;
  "data-testid"?: string;
};

export const Tree = <T = unknown,>({
  data,
  selectedId,
  expandedIds,
  selectable = true,
  showIcons = true,
  defaultExpanded = false,
  defaultExpandIcon = "triangle",
  onSelect,
  onExpand,
  onNodeClick,
  onLoadChildren,
  renderNode,
  className,
  "data-testid": dataTestId
}: TreeProps<T>) => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<string[]>(
    () => {
      if (expandedIds) return expandedIds;
      if (defaultExpanded) {
        const getAllNodeIds = (nodes: TreeNode[]): string[] => {
          const ids: string[] = [];
          nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
              ids.push(node.id, ...getAllNodeIds(node.children));
            }
          });
          return ids;
        };
        return getAllNodeIds(data);
      }
      return [];
    }
  );

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedId || null
  );

  // State for dynamically loaded children
  const [loadedChildren, setLoadedChildren] = useState<
    Record<string, TreeNode<T>[]>
  >({});
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  const getNodeChildren = useCallback(
    (node: TreeNode<T>): TreeNode<T>[] => {
      // If node has static children, use those
      if (node.children && node.children.length > 0) {
        return node.children;
      }
      // Otherwise, check if we have dynamically loaded children
      return loadedChildren[node.id] || [];
    },
    [loadedChildren]
  );

  const hasChildren = useCallback(
    (node: TreeNode<T>): boolean => {
      // Has static children
      if (node.children && node.children.length > 0) return true;
      // Has loaded children
      if (loadedChildren[node.id] && loadedChildren[node.id].length > 0)
        return true;
      // Marked as having children that can be loaded
      if (node.hasChildren) return true;
      return false;
    },
    [loadedChildren]
  );

  const isNodeLoading = useCallback(
    (nodeId: string) => {
      return loadingNodes.has(nodeId);
    },
    [loadingNodes]
  );

  const isExpanded = useCallback(
    (nodeId: string) => {
      const expandedSet = expandedIds || internalExpandedIds;
      return expandedSet.includes(nodeId);
    },
    [expandedIds, internalExpandedIds]
  );

  const isSelected = useCallback(
    (nodeId: string) => {
      const currentSelected =
        selectedId !== undefined ? selectedId : internalSelectedId;
      return currentSelected === nodeId;
    },
    [selectedId, internalSelectedId]
  );

  const loadChildrenForNode = useCallback(
    async (node: TreeNode<T>) => {
      if (!onLoadChildren || !node.hasChildren || loadedChildren[node.id]) {
        return;
      }

      setLoadingNodes((prev) => new Set(prev).add(node.id));

      try {
        const children = await onLoadChildren(node);
        setLoadedChildren((prev) => ({
          ...prev,
          [node.id]: children
        }));
      } catch (error) {
        console.error(`Failed to load children for node ${node.id}:`, error);
      } finally {
        setLoadingNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      }
    },
    [onLoadChildren, loadedChildren]
  );

  const toggleExpanded = useCallback(
    async (node: TreeNode<T>) => {
      const nodeId = node.id;
      const currentExpanded = expandedIds || internalExpandedIds;
      const wasExpanded = isExpanded(nodeId);

      if (!wasExpanded) {
        // Expanding - load children if needed (only for nodes with hasChildren but no static children)
        if (
          node.hasChildren &&
          (!node.children || node.children.length === 0)
        ) {
          await loadChildrenForNode(node);
        }
      }

      const newExpanded = wasExpanded
        ? currentExpanded.filter((id) => id !== nodeId)
        : [...currentExpanded, nodeId];

      if (!expandedIds) {
        setInternalExpandedIds(newExpanded);
      }
      onExpand?.(newExpanded);
    },
    [
      expandedIds,
      internalExpandedIds,
      isExpanded,
      onExpand,
      loadChildrenForNode
    ]
  );

  const findNodeById = useCallback(
    (nodes: TreeNode<T>[], id: string): TreeNode<T> | null => {
      for (const node of nodes) {
        if (node.id === id) return node;

        // Search in static children
        if (node.children) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }

        // Search in loaded children
        const nodeLoadedChildren = loadedChildren[node.id];
        if (nodeLoadedChildren) {
          const found = findNodeById(nodeLoadedChildren, id);
          if (found) return found;
        }
      }
      return null;
    },
    [loadedChildren]
  );

  const toggleSelected = useCallback(
    (node: TreeNode<T>) => {
      if (!selectable || node.disabled) return;

      const newSelected = isSelected(node.id) ? null : node.id;

      if (selectedId === undefined) {
        setInternalSelectedId(newSelected);
      }

      const selectedNode = newSelected ? findNodeById(data, newSelected) : null;
      onSelect?.(newSelected, selectedNode);
    },
    [selectable, selectedId, isSelected, onSelect, findNodeById, data]
  );

  const handleNodeClick = useCallback(
    (node: TreeNode<T>, nodeHasChildren: boolean) => {
      if (nodeHasChildren) {
        toggleExpanded(node);
        onNodeClick?.(node, !isExpanded(node.id));
      } else {
        toggleSelected(node);
        onNodeClick?.(node, undefined);
      }
    },
    [toggleExpanded, toggleSelected, isExpanded, onNodeClick]
  );

  const renderTreeNode = useCallback(
    (node: TreeNode<T>, level = 0): ReactNode => {
      const nodeHasChildren = hasChildren(node);
      const expanded = nodeHasChildren && isExpanded(node.id);
      const selected = isSelected(node.id);
      const isLeaf = !nodeHasChildren;
      const loading = isNodeLoading(node.id);
      const children = getNodeChildren(node);

      if (renderNode) {
        return renderNode(node, level);
      }

      return (
        <TreeNodeContainer key={node.id}>
          <TreeNodeContent
            onClick={() => handleNodeClick(node, nodeHasChildren)}
            level={level}
            selected={selected && isLeaf && selectable}
            disabled={node.disabled || loading}
            hasChildren={nodeHasChildren}
            role={
              nodeHasChildren ? "button" : selectable ? "option" : "treeitem"
            }
            aria-expanded={nodeHasChildren ? expanded : undefined}
            aria-selected={selectable && isLeaf ? selected : undefined}
            data-testid={`${dataTestId}-node-${node.id}`}
          >
            <NodeIndent level={level} />
            {nodeHasChildren && showIcons && (
              <FolderIcon
                expanded={expanded || false}
                isDefaultIcon={!node.icon}
                loading={loading}
              >
                {loading ? (
                  <Icon icon="circle" size="small" aria-hidden="true" />
                ) : (
                  <Icon
                    icon={node.icon || defaultExpandIcon}
                    size="small"
                    aria-hidden="true"
                  />
                )}
              </FolderIcon>
            )}
            {!nodeHasChildren && showIcons && node.icon && (
              <NodeIcon>
                <Icon icon={node.icon} size="small" aria-hidden="true" />
              </NodeIcon>
            )}
            <NodeLabel>
              <Typography
                size="body"
                color={node.disabled ? "weak" : undefined}
              >
                {node.label}
              </Typography>
            </NodeLabel>
          </TreeNodeContent>
          {nodeHasChildren && expanded && !loading && (
            <TreeNodeChildren>
              {children.map((child) => renderTreeNode(child, level + 1))}
            </TreeNodeChildren>
          )}
        </TreeNodeContainer>
      );
    },
    [
      hasChildren,
      isExpanded,
      isSelected,
      isNodeLoading,
      getNodeChildren,
      handleNodeClick,
      renderNode,
      selectable,
      showIcons,
      dataTestId,
      defaultExpandIcon
    ]
  );

  return (
    <TreeContainer className={className} data-testid={dataTestId}>
      {data.map((node) => renderTreeNode(node, 0))}
    </TreeContainer>
  );
};

const TreeContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  color: theme.content.main
}));

const TreeNodeContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column"
}));

const TreeNodeContent = styled("div")<{
  level: number;
  selected?: boolean;
  disabled?: boolean;
  hasChildren?: boolean;
}>(({ theme, selected, disabled }) => ({
  display: "flex",
  alignItems: "center",
  cursor: disabled ? "not-allowed" : "pointer",
  padding: `${theme.spacing.smallest}px`,
  borderRadius: theme.radius.small,
  backgroundColor: selected ? theme.select.main : "transparent",
  color: selected ? theme.content.withBackground : theme.content.main,
  userSelect: "none",

  "&:hover":
    !disabled && !selected
      ? {
          backgroundColor: theme.bg[2]
        }
      : {},

  "&:focus": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
  }
}));

const NodeIndent = styled("div")<{
  level: number;
}>(({ level }) => ({
  width: level * 20,
  flexShrink: 0
}));

const FolderIcon = styled("div", {
  shouldForwardProp: (prop) =>
    !["expanded", "isDefaultIcon", "loading"].includes(prop)
})<{
  expanded: boolean;
  isDefaultIcon: boolean;
  loading?: boolean;
}>(({ expanded, isDefaultIcon, loading, theme }) => ({
  width: 16,
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.smallest,
  flexShrink: 0,
  // Only rotate the default triangle icon, not custom folder icons
  transform:
    isDefaultIcon && !loading
      ? expanded
        ? "rotate(-90deg)"
        : "rotate(-180deg)"
      : "none",
  transition: isDefaultIcon && !loading ? "transform 0.2s ease-in-out" : "none",

  // Loading animation for circle icon
  ...(loading && {
    animation: "spin 1s linear infinite",
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" }
    }
  })
}));

const NodeIcon = styled("div")(({ theme }) => ({
  width: 16,
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.smallest,
  flexShrink: 0
}));

const NodeLabel = styled("div")(() => ({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));

const TreeNodeChildren = styled("div")(() => ({
  display: "flex",
  flexDirection: "column"
}));
