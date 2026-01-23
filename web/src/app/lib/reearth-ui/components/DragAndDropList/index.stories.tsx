import { styled } from "@reearth/services/theme";
import { Meta, StoryFn } from "@storybook/react-vite";
import { ReactNode, useState } from "react";

import { Icon } from "../Icon";

import { DragAndDropList, DragAndDropListProps } from ".";

interface Item {
  id: string;
  content: ReactNode;
}

const meta: Meta<DragAndDropListProps<Item>> = {
  component: DragAndDropList
};
export default meta;

const MockItem = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing.smallest,
  border: theme.outline.weakest,
  borderRadius: theme.radius.small,
  backgroundColor: theme.bg[1]
}));

const MockListContainer = styled("div")(({ theme }) => ({
  width: 300,
  border: theme.outline.main
}));

const DefaultComponent: typeof DragAndDropList<Item> = (args) => {
  const [list1, setList1] = useState<Item[]>([
    { id: "1", content: <MockItem>Item 1</MockItem> },
    { id: "2", content: <MockItem>Item 2</MockItem> },
    { id: "3", content: <MockItem>Item 3</MockItem> }
  ]);

  return (
    <MockListContainer>
      <DragAndDropList items={list1} setItems={setList1} {...args} />
    </MockListContainer>
  );
};

export const Default: StoryFn = () => {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "space-around"
      }}
    >
      <DefaultComponent />
    </div>
  );
};

const handleClassName = "asldkfja";

const HandleComponent: typeof DragAndDropList<Item> = (args) => {
  const [list1, setList1] = useState<Item[]>([
    {
      id: "1",
      content: (
        <MockItem>
          <Icon className={handleClassName} icon="circle" />
          Item 1
        </MockItem>
      )
    },
    {
      id: "2",
      content: (
        <MockItem>
          <Icon className={handleClassName} icon="circle" />
          Item 2
        </MockItem>
      )
    },
    {
      id: "3",
      content: (
        <MockItem>
          <Icon className={handleClassName} icon="circle" />
          Item 3
        </MockItem>
      )
    }
  ]);

  return (
    <MockListContainer>
      <DragAndDropList items={list1} setItems={setList1} {...args} />
    </MockListContainer>
  );
};

export const Handle: StoryFn = () => {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "space-around"
      }}
    >
      <HandleComponent handleClassName={handleClassName} />
    </div>
  );
};

const SharedComponent: typeof DragAndDropList<Item> = (args) => {
  const [list1, setList1] = useState<Item[]>([
    { id: "1", content: <MockItem>Item 1</MockItem> },
    { id: "2", content: <MockItem>Item 2</MockItem> },
    { id: "3", content: <MockItem>Item 3</MockItem> }
  ]);

  const [list2, setList2] = useState<Item[]>([
    { id: "4", content: <MockItem>Item 4</MockItem> },
    { id: "5", content: <MockItem>Item 5</MockItem> },
    { id: "6", content: <MockItem>Item 6</MockItem> }
  ]);

  return (
    <>
      <MockListContainer>
        <DragAndDropList
          items={list1}
          setItems={setList1}
          group="shared-group"
          {...args}
        />
      </MockListContainer>
      <MockListContainer>
        <DragAndDropList
          items={list2}
          setItems={setList2}
          group="shared-group"
          {...args}
        />
      </MockListContainer>
    </>
  );
};

export const Shared: StoryFn = () => {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "space-around"
      }}
    >
      <SharedComponent />
    </div>
  );
};

export const Copy: StoryFn = () => {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "space-around"
      }}
    >
      <SharedComponent group={{ name: "shared", pull: "clone" }} />
    </div>
  );
};
