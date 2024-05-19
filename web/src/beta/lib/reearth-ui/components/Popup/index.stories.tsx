import { Meta, StoryObj } from "@storybook/react";

import * as Popup from "./";

export default {
  component: Popup.Provider,
} as Meta;

type Story = StoryObj<typeof Popup.Provider>;

export const Controlled: Story = {
  render: args => {
    return <Popup.Provider {...args} />;
  },
  args: {
    children: (
      <>
        <Popup.Trigger title="Controled" />
        <Popup.Content>
          <div>
            If you pass open or onOpenChange, you can handle open state by yourself.
            <br />
            Which means the PopupClose component does not change state automatically but still
            causes event.
          </div>{" "}
        </Popup.Content>
      </>
    ),
    open: true,
    placement: "top",
    modal: true,
  },
};

export const Uncontrolled: Story = {
  render: args => {
    return (
      <div style={{ maxWidth: "200px", margin: "0 auto" }}>
        <Popup.Provider {...args} />
      </div>
    );
  },
  args: {
    children: (
      <>
        <Popup.Trigger title="Default Button" />
        <Popup.Content style={{ background: "gray" }}>
          <div>
            If you do not pass both open and onOpenChange, automatically managed open state by this
            component.
          </div>
        </Popup.Content>
      </>
    ),
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
    offset: {
      mainAxis: 20,
      crossAxis: 300,
      alignmentAxis: 0,
    },
    modal: true,
  },
};

export const customTrigger: Story = {
  render: args => {
    return (
      <div style={{ maxWidth: "200px", margin: "0 auto" }}>
        <Popup.Provider {...args} />
      </div>
    );
  },
  args: {
    children: (
      <>
        <Popup.Trigger asChild>
          <div style={{ cursor: "pointer" }}>Trigger me</div>
        </Popup.Trigger>
        <Popup.Content style={{ background: "gray" }}>
          <div>
            If you do not pass both open and onOpenChange, automatically managed open state by this
            component.
          </div>
        </Popup.Content>
      </>
    ),
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
    offset: {
      mainAxis: 20,
      crossAxis: 300,
      alignmentAxis: 0,
    },
    modal: true,
  },
};
