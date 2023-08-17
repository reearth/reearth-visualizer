import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";

import Button from "@reearth/beta/components/Button";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

import TabMenu from "./index";

export default {
  component: TabMenu,
} as Meta;

type Story = StoryObj<typeof TabMenu>;

const SampleComponent = () => {
  return (
    <div>
      <Button margin="auto" buttonType="primary" text="Disabled Sample Button" disabled />
      <JSONTag>
        {JSON.stringify(
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: "Dinagat Islands",
            },
          },
          null,
          2,
        )}
      </JSONTag>
    </div>
  );
};

const JSONTag = styled.pre`
  background: ${({ theme }) => theme.bg[0]};
  color: ${({ theme }) => theme.content.main};
  border-radius: 10px;
  padding: 10px;
`;

export const Default: Story = args => {
  const [_, updateArgs] = useArgs();

  const handleChange = (tab: string) => updateArgs({ selectedTab: tab });

  return <TabMenu {...args} onSelectedTabChange={handleChange} />;
};

Default.args = {
  title: "Right panel",
  tabs: [
    { key: "tab1", icon: "infobox", component: <SampleComponent /> },
    {
      key: "tab2",
      icon: "dl",
      component: <Text size="body">Tab 2. Can be any react component</Text>,
    },
  ],
  selectedTab: "tab1",
};
