import { Meta, StoryObj } from "@storybook/react";

import * as Popover from "./";

export default {
  component: Popover.Provider,
} as Meta;

type Story = StoryObj<typeof Popover.Provider>;

export const Controlled: Story = {
  render: args => {
    return <Popover.Provider {...args} />;
  },
  args: {
    children: (
      <>
        <Popover.Trigger>
          <div style={{ background: "gray" }}>Trigger(cannot toggle by click)</div>
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
    return <Popover.Provider {...args} />;
  },
  args: {
    children: (
      <>
        <Popover.Trigger>
          <div style={{ background: "gray" }}>Trigger</div>
        </Popover.Trigger>
        <Popover.Content style={{ background: "gray" }}>
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
