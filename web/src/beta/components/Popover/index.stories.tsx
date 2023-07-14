import { Meta, StoryObj } from "@storybook/react";

import * as Popover from "./";

export default {
  component: Popover.Root,
} as Meta;

type Story = StoryObj<typeof Popover.Root>;

export const Controlled: Story = {
  render: args => {
    return <Popover.Root {...args} />;
  },
  args: {
    children: (
      <>
        <Popover.Trigger>
          <div style={{ background: "#fff" }}>Trigger to show</div>
        </Popover.Trigger>
        <Popover.Content>
          <div>
            If you pass open or onOpenChange, you can handle open state by yourself.
            <br />
            Which means the PopoverClose component does not change state automatically but still
            causes event.
          </div>
          <Popover.Close style={{ color: "inherit" }}>Close</Popover.Close>
        </Popover.Content>
      </>
    ),
    open: true,
    initialOpen: false,
    placement: "top",
    modal: true,
  },
};

export const Uncontrolled: Story = {
  render: args => {
    return <Popover.Root {...args} />;
  },
  args: {
    children: (
      <>
        <Popover.Trigger>
          <div style={{ background: "#fff" }}>Trigger to show</div>
        </Popover.Trigger>
        <Popover.Content>
          <div>
            If you do not pass both open and onOpenChange, automatically managed open state by this
            component.
          </div>
          <Popover.Close style={{ color: "inherit" }}>Close</Popover.Close>
        </Popover.Content>
      </>
    ),
    open: undefined,
    onOpenChange: undefined,
    initialOpen: true,
    placement: "top",
    modal: true,
  },
};
