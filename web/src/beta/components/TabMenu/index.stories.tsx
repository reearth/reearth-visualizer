import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";

import Button from "@reearth/beta/components/Button";
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

export const Default: Story = args => {
  const [_, updateArgs] = useArgs();

  const onSelectedTabChange = (tab: string) => updateArgs({ selectedTab: tab });
  return <TabMenu onSelectedTabChange={onSelectedTabChange} {...args} />;
};

Default.args = {
  title: "Right panel",
  tabs: {
    tab1: { icon: "infobox", component: <SampleComponent /> },
    tab2: { icon: "dl", component: <div>Tab 2. Can be any react component</div> },
  },
  selectedTab: "tab1",
};

const JSONTag = styled.pre`
  background: lightgrey;
  color: black;
  border-radius: 10px;
  padding: 10px;
`;
