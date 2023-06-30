import { Meta, StoryObj } from "@storybook/react";
import { ReactNode, useState, useRef } from "react";

import Button from "@reearth/beta/components/Button";

import Component from ".";

const meta: Meta<typeof Component> = {
  component: Component,
};

export default meta;

type Story = StoryObj<typeof Component>;

const Wrapper: React.FC<{
  onClickAway?: () => void;
  onEscapeKeyDown?: () => void;
  children: ReactNode;
}> = ({ onClickAway, onEscapeKeyDown, children }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef}>
      <Button onClick={() => setOpen(!open)} />
      <Component
        wrapperRef={wrapperRef}
        open={open}
        onClickAway={onClickAway}
        onEscapeKeyDown={onEscapeKeyDown}>
        {children}
      </Component>
    </div>
  );
};

export const Default: Story = {
  args: {
    children: <input type="text" />,
  },
  render: args => {
    return <Wrapper {...args} />;
  },
};
