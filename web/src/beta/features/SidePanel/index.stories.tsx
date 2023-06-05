import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps } from "react";

import Component from ".";

export default {
  component: Component,
  render: args => {
    return (
      <div style={{ height: "100vh", backgroundColor: "red" }}>
        <Component {...args} />
      </div>
    );
  },
} as Meta<ComponentProps<typeof Component>>;

export const LeftSingleContent: StoryObj<typeof Component> = {
  args: {
    location: "left",
    contents: [
      {
        id: "Title",
        title: "title",
        children: <div>content</div>,
      },
    ],
  },
};

export const RightMultiContents: StoryObj<typeof Component> = {
  args: {
    location: "left",
    contents: [
      {
        id: "a",
        title: "title",
        children: <div>content</div>,
      },
      {
        id: "b",
        title: (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>You can pass component as well</div>
            <div>can put icon etc</div>
          </div>
        ),
        maxHeight: "20%",
        children: <div>content</div>,
      },
    ],
  },
};
