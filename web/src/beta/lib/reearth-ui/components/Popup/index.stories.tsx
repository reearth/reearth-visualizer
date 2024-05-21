import { Meta, StoryObj } from "@storybook/react";
import { FC, useState } from "react";

import { fonts, styled } from "@reearth/services/theme";

import { Button } from "../Button";

import { Popup, PopupProps } from ".";

const meta: Meta<PopupProps> = {
  component: Popup,
};

export default meta;
type Story = StoryObj<typeof Popup>;

const MockChild: FC = () => (
  <Container>
    <Title>Title</Title>
    <Content>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
    </Content>
  </Container>
);

const Container = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  padding: ` ${theme.spacing.small}px`,
  width: "150px",
  height: "auto",
  color: theme.content.main,
  boxShadow: theme.shadow.card,
  borderRadius: theme.radius.small,
}));

const Title = styled("div")(() => ({
  fontSize: fonts.sizes.h5,
  lineHeight: `${fonts.lineHeights.h5}px`,
}));

const PopupWrapper = styled("div")(() => ({
  maxWidth: "200px",
  margin: "140px auto",
}));

const Content = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
  width: "fit-content",
}));

export const BasicTrigger: Story = {
  render: args => {
    return <Popup {...args} />;
  },
  args: {
    title: "Trigger Me",
    children: <MockChild />,
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
  },
};

const CustomTrigger: FC<PopupProps> = args => {
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Popup
      {...args}
      trigger={
        <div onClick={handleToggle}>
          <Button title="Trigger Me" appearance="primary" />
        </div>
      }
    />
  );
};

export const CustomTriggerComponent: Story = {
  render: args => <CustomTrigger {...args} />,
  args: {
    asChild: true,
    placement: "bottom",
    children: <MockChild />,
  },
};

export const MultleTrigger: Story = {
  render: args => {
    return (
      <Wrapper>
        <Popup title="Button1" {...args} />
        <Popup title="Button2" {...args} />
      </Wrapper>
    );
  },
  args: {
    children: <MockChild />,
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
  },
};

export const Placement: Story = {
  render: args => {
    return (
      <PopupWrapper>
        <Popup {...args} />
      </PopupWrapper>
    );
  },
  args: {
    title: "Trigger Me",
    children: <MockChild />,
    open: undefined,
    onOpenChange: undefined,
    placement: "top",
  },
};
