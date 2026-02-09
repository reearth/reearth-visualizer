import { fonts, styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { Meta, StoryObj } from "@storybook/react-vite";
import { FC, useCallback, useState } from "react";

import { Button } from "../Button";

import { Popup, PopupProps } from ".";

const meta: Meta<PopupProps> = {
  component: Popup
};

export default meta;
type Story = StoryObj<typeof Popup>;

const MockChild: FC = () => (
  <Container>
    <Title>Title</Title>
    <Content>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum
    </Content>
  </Container>
);

const MockChildWithClose: FC<{ onClose: () => void }> = ({ onClose }) => (
  <Container>
    <Title>Title</Title>
    <Content>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum
    </Content>
    <Button title="Close" onClick={onClose} />
  </Container>
);

const Container = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  padding: ` ${theme.spacing.small}px`,
  width: "150px",
  height: "auto",
  color: theme.content.main,
  boxShadow: theme.shadow.card,
  borderRadius: theme.radius.small
}));

const Title = styled("div")(() => ({
  fontSize: fonts.sizes.h5,
  lineHeight: `${fonts.lineHeights.h5}px`
}));

const Content = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center
}));

export const BasicTrigger: Story = {
  render: (args) => {
    return <Popup {...args} />;
  },
  args: {
    trigger: "Click me",
    children: <MockChild />,
    placement: "bottom"
  },
  parameters: {
    docs: {
      description: {
        story:
          "When passing a string as a trigger, it will be rendered as a button."
      }
    }
  }
};

export const CustomTrigger: Story = {
  render: (args) => (
    <Popup
      {...args}
      trigger={<Button title="Click me" appearance="primary" />}
    />
  ),
  args: {
    placement: "bottom",
    children: <MockChild />
  }
};

export const MultipleTrigger: Story = {
  render: (args) => {
    return (
      <Wrapper>
        <Popup trigger="Click me" {...args} />
        <Popup trigger="Click me" {...args} />
      </Wrapper>
    );
  },
  args: {
    children: <MockChild />,
    placement: "bottom"
  }
};

export const Placement: Story = {
  render: (args) => {
    return (
      <div
        style={{
          height: 500,
          display: css.display.grid,
          gridTemplateRows: "1fr 1fr 1fr 1fr 1fr",
          gridTemplateColumns: "1fr 1fr 1fr",
          justifyItems: "center",
          alignItems: css.alignItems.center
        }}
      >
        <Popup {...args} trigger="top-start" placement="top-start" />
        <Popup {...args} trigger="top" placement="top" />
        <Popup {...args} trigger="top-end" placement="top-end" />
        <Popup {...args} trigger="left-start" placement="left-start" />
        <div />
        <Popup {...args} trigger="right-start" placement="right-start" />
        <Popup {...args} trigger="left" placement="left" />
        <div />
        <Popup {...args} trigger="right" placement="right" />
        <Popup {...args} trigger="left-end" placement="left-end" />
        <div />
        <Popup {...args} trigger="right-end" placement="right-end" />
        <Popup {...args} trigger="bottom-start" placement="bottom-start" />
        <Popup {...args} trigger="bottom" placement="bottom" />
        <Popup {...args} trigger="bottom-end" placement="bottom-end" />
      </div>
    );
  },
  args: {
    children: <MockChild />
  }
};

const ControlledComponent: FC = () => {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Popup
      trigger={<Button title="Click me" appearance="primary" />}
      open={open}
      onOpenChange={setOpen}
    >
      <MockChildWithClose onClose={handleClose} />
    </Popup>
  );
};

export const Controlled: Story = {
  render: () => <ControlledComponent />
};
