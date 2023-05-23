import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";
import { forwardRef, Ref, useState } from "react";

import { ItemProps } from "./types";

import Component, { Props, Item } from ".";

export default {
  title: "atoms/TreeView",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

type Content = {
  title: string;
};

const item: Item<Content> = {
  id: "root",
  content: { title: "" },
  children: [
    { id: "x", content: { title: "X" }, draggable: true, droppable: true, selectable: false },
    {
      id: "y",
      content: { title: "Y" },
      draggable: true,
      droppable: true,
      selectable: true,
      expandable: true,
      droppableIntoChildren: true,
      children: [
        { id: "a", content: { title: "A" }, draggable: true, droppable: true, selectable: true },
        { id: "b", content: { title: "b" }, draggable: true, droppable: true, selectable: true },
        {
          id: "c",
          content: { title: "C" },
          draggable: true,
          droppable: true,
          selectable: true,
          expandable: true,
          children: [
            {
              id: "g",
              content: { title: "G" },
              draggable: true,
              droppable: true,
              selectable: true,
            },
            {
              id: "h",
              content: { title: "H" },
              draggable: true,
              droppable: true,
              selectable: true,
            },
            {
              id: "i",
              content: { title: "I" },
              draggable: true,
              droppable: true,
              selectable: true,
            },
          ],
        },
        { id: "d", content: { title: "d" }, draggable: true, droppable: true, selectable: true },
        {
          id: "e",
          content: { title: "e" },
          draggable: true,
          droppable: true,
          selectable: true,
          expandable: true,
          droppableIntoChildren: true,
          children: [],
        },
        {
          id: "f",
          content: { title: "f" },
          draggable: true,
          droppable: true,
          selectable: true,
          expandable: true,
          droppableIntoChildren: false,
          children: [
            {
              id: "j",
              content: { title: "J" },
              draggable: false,
              droppable: false,
              selectable: true,
            },
          ],
        },
      ],
    },
    { id: "z", content: { title: "Z" }, draggable: true, droppable: true, selectable: true },
  ],
};

function ItemInnerComponent(
  {
    item,
    depth,
    onSelect,
    onExpand,
    selected,
    expanded,
    expandable,
    canDrop,
    isDropping,
    dropType,
    shown,
    children,
  }: ItemProps<Content>,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <>
      <div
        ref={ref}
        style={{
          display: shown ? "block" : "none",
          color: "#fff",
          backgroundColor: selected ? "#cc0" : "#666",
          padding: "10px",
          marginLeft: depth * 20 + "px",
          userSelect: "none",
          borderWidth: "3px",
          borderStyle: "solid",
          borderColor:
            canDrop && isDropping && dropType
              ? {
                  top: "red transparent transparent transparent",
                  bottom: "transparent transparent red transparent",
                  topOfChildren: "transparent transparent orange transparent",
                  bottomOfChildren: "red",
                }[dropType] || "transparent"
              : "transparent",
        }}
        onClick={() => {
          onExpand();
          onSelect();
        }}>
        {expandable ? (expanded ? "⬇️ " : "➡️ ") : null}
        {item.content?.title} {dropType}
      </div>
      {shown ? children : null}
    </>
  );
}

const ItemComponent = forwardRef(ItemInnerComponent);

export const Default: Story<Props> = args => {
  const [item2, setItem] = useState(item);
  return (
    <Component
      {...args}
      item={item2}
      renderItem={ItemComponent}
      onDrop={(src, dest, srcIndex, index, parent) => {
        action("onDrop")(src, dest, srcIndex, index, parent);

        parent.children?.splice(srcIndex[srcIndex.length - 1], 1);
        dest.children = [
          ...(dest.children?.slice(0, index[index.length - 1]) ?? []),
          src,
          ...(dest.children?.slice(index[index.length - 1]) ?? []),
        ];
        setItem({
          ...item2,
        });
      }}
    />
  );
};

Default.args = {
  dragItemType: "test",
  expandable: true,
  selectable: true,
  draggable: true,
  droppable: true,
  multiple: false,
};
