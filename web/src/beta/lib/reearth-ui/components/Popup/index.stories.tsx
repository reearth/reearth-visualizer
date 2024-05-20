import { Meta, StoryObj } from "@storybook/react";
import { FC, useState } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import * as Popup from "@reearth/beta/lib/reearth-ui/components/Popup";
import { fonts, styled } from "@reearth/services/theme";

export default {
  component: Popup.Provider,
} as Meta;

type Story = StoryObj<typeof Popup.Provider>;

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

const Content = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));

const PopupWrapper = styled("div")(() => ({
  maxWidth: "200px",
  margin: "140px auto",
}));

const TriggerWrapper = styled("div")(() => ({
  display: "inline-block",
  margin: "auto",
}));

const DefaultOpenComponent: FC<Popup.PopupOptionsProps> = args => {
  const [open, setOpen] = useState(true);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <PopupWrapper>
      <Popup.Provider {...args} open={open} onOpenChange={setOpen}>
        <Popup.Trigger asChild>
          <TriggerWrapper onClick={handleToggle}>
            <Button title="Trigger Me" appearance="primary" />
          </TriggerWrapper>
        </Popup.Trigger>
        <Popup.Content>
          <MockChild />
        </Popup.Content>
      </Popup.Provider>
    </PopupWrapper>
  );
};

export const DefaultOpen: Story = {
  render: args => <DefaultOpenComponent {...args} />,
  args: {
    placement: "top",
  },
};

export const Trigger: Story = {
  render: args => {
    return (
      <PopupWrapper>
        <Popup.Provider {...args} />
      </PopupWrapper>
    );
  },
  args: {
    children: (
      <>
        <Popup.Trigger title="Trigger Me" style={{ display: "inline-block" }} />
        <Popup.Content>
          <MockChild />
        </Popup.Content>
      </>
    ),
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
  },
};

export const Flip: Story = {
  render: args => {
    return <Popup.Provider {...args} />;
  },
  args: {
    children: (
      <>
        <Popup.Trigger title="Trigger Me" style={{ display: "inline-block", margin: "20px " }} />
        <Popup.Content>
          <MockChild />
        </Popup.Content>
      </>
    ),
    open: undefined,
    onOpenChange: undefined,
    placement: "bottom",
  },
};
