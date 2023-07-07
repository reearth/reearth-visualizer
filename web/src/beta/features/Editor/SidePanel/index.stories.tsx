import { Meta, StoryObj } from "@storybook/react";

import * as SidePanel from "@reearth/beta/features/Editor/SidePanel/index";

const meta: Meta<typeof SidePanel.Wrapper> = {
  component: SidePanel.Wrapper,
};

export default meta;

type Story = StoryObj<typeof SidePanel.Wrapper>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <SidePanel.Wrapper location="left">
        <SidePanel.Section maxHeight="33%">
          <SidePanel.Card>
            <SidePanel.Title>Title1</SidePanel.Title>
            <SidePanel.Content>
              Please check this story how to use these separated components.
            </SidePanel.Content>
          </SidePanel.Card>
        </SidePanel.Section>
        <SidePanel.Section>
          <SidePanel.Card>
            <SidePanel.Title>Title2</SidePanel.Title>
            <SidePanel.Content>content</SidePanel.Content>
          </SidePanel.Card>
        </SidePanel.Section>
      </SidePanel.Wrapper>
    </div>
  ),
};
