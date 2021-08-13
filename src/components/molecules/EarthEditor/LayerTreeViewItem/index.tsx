import React, { forwardRef, PropsWithChildren, Ref, useCallback, useMemo } from "react";

import { styled } from "@reearth/theme";
import type { ItemProps, DropType, Item } from "@reearth/components/atoms/TreeView";
import Layer, { Layer as LayerType, Format } from "./Layer";

export type Layer<T = unknown> = LayerType<T>;

export type Props<T = unknown> = ItemProps<Layer<T>> & {
  className?: string;
  rootLayerId?: string;
  selectedLayerId?: string;
  visibilityShown?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
  onRename?: (name: string) => void;
  onRemove?: (selectedLayerId: string) => void;
  onGroupCreate?: () => void;
  onImport?: (file: File, format: Format) => void;
};

function LayerTreeViewItem<T = unknown>(
  {
    className,
    rootLayerId,
    selectedLayerId,
    children,
    shown,
    item,
    selected,
    childSelected,
    expanded,
    dropType,
    canDrop,
    selectable,
    siblings,
    visibilityShown,
    onSelect,
    onExpand,
    onVisibilityChange,
    onRename,
    onRemove,
    onGroupCreate,
    onImport,
  }: PropsWithChildren<Props<T>>,
  ref: Ref<HTMLDivElement>,
) {
  const handleClick = useCallback(() => {
    if (!item.selectable) {
      onExpand?.();
    } else {
      onSelect?.();
    }
  }, [item.selectable, onExpand, onSelect]);

  const allSiblingsDoesNotHaveChildren = !!siblings?.every(s => !s.content.group);

  return (
    <Wrapper
      className={className}
      shown={shown}
      selected={selected}
      dropType={canDrop ? dropType : undefined}>
      <Layer
        ref={ref}
        rootLayerId={rootLayerId}
        selectedLayerId={selectedLayerId}
        selected={selected}
        expanded={expanded}
        disabled={!selectable}
        layer={item.content}
        dropType={
          canDrop && dropType !== "topOfChildren" && (dropType !== "bottom" || !expanded)
            ? dropType
            : undefined
        }
        allSiblingsDoesNotHaveChildren={allSiblingsDoesNotHaveChildren}
        visibilityShown={visibilityShown}
        onClick={handleClick}
        onExpand={onExpand}
        onVisibilityChange={onVisibilityChange}
        onRename={onRename}
        onRemove={onRemove}
        onGroupCreate={onGroupCreate}
        onImport={onImport}
        childSelected={childSelected}
      />
      {children && (
        <Children expanded={expanded} dropType={canDrop ? dropType : undefined}>
          {children}
        </Children>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div<{ shown: boolean; selected?: boolean; dropType?: DropType }>`
  display: ${({ shown }) => (shown ? "block" : "none")};
`;

const Children = styled.div<{ dropType?: DropType; expanded?: boolean }>`
  margin-left: 18px;
  box-sizing: border-box;
  border: 2px ${({ expanded }) => (expanded ? "solid" : "none")} transparent;
  border-top-color: ${({ dropType, expanded, theme }) =>
    dropType === "topOfChildren"
      ? theme.main.danger
      : dropType === "bottom" && expanded
      ? `transparent transparent ${theme.main.danger} transparent`
      : "transparent"};
`;

export default forwardRef(LayerTreeViewItem);

// forwardRef function does not support generic types,
// so we have to generate a new component to use my own type as items.
export function useLayerTreeViewItem<T>({
  rootLayerId,
  selectedLayerId,
  className,
  visibilityShown,
  onVisibilityChange,
  onRename,
  onRemove,
  onGroupCreate,
  onImport,
}: {
  rootLayerId?: string;
  selectedLayerId?: string;
  className?: string;
  visibilityShown?: boolean;
  onVisibilityChange?: (element: Item<Layer<T>>, isVisible: boolean) => void;
  onRename?: (element: Item<Layer<T>>, name: string) => void;
  onRemove?: (selectedLayerId: string) => void;
  onGroupCreate?: () => void;
  onImport?: (file: File, format: Format) => void;
} = {}) {
  return useMemo(() => {
    function InnerLayerTreeViewItem(props: Props<T>, ref: Ref<HTMLDivElement>) {
      const item = props?.item;
      const events = useMemo(
        () => ({
          onVisibilityChange: item
            ? (isVisible: boolean) => onVisibilityChange?.(item, isVisible)
            : undefined,
          onRename: item ? (name: string) => onRename?.(item, name) : undefined,
        }),
        [item],
      );

      return LayerTreeViewItem<T>(
        {
          ...props,
          rootLayerId,
          selectedLayerId,
          className,
          visibilityShown,
          onRemove,
          onGroupCreate,
          onImport,
          ...events,
        },
        ref,
      );
    }
    return forwardRef(InnerLayerTreeViewItem);
  }, [
    rootLayerId,
    selectedLayerId,
    className,
    visibilityShown,
    onRemove,
    onGroupCreate,
    onImport,
    onVisibilityChange,
    onRename,
  ]);
}
