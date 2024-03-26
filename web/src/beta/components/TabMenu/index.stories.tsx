import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { ReactNode, CSSProperties } from "react";

import Button from "@reearth/beta/components/Button";
import Resizable from "@reearth/beta/components/Resizable";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

import TabMenu, { Props } from "./index";

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

const Container: React.FC<{ children?: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => <div style={{ display: "flex", height: "100vh", ...style }}>{children}</div>;

const Pane = (
  <div
    style={{
      flex: 1,
      background: "#ffffff",
      color: "black",
      fontSize: 24,
      textAlign: "center",
      padding: "25vh 5rem",
    }}>
    {" "}
    Whatever the main area holds. The tab panel works only when on the <b>left</b> with{" "}
    <b>flex 100%</b>. Which is to do with <b>Resizable Component</b> and not the left panel.
  </div>
);

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (tab: string) => updateArgs({ selectedTab: tab });

  return (
    <Container style={{ flexDirection: "row" }}>
      {Pane}
      <Resizable direction="vertical" gutter="start" initialSize={500} minSize={200}>
        <TabMenu {...args} onSelectedTabChange={handleChange} />
      </Resizable>
    </Container>
  );
};

Default.args = {
  tabs: [
    { id: "tab1", name: "My infobox", icon: "infobox", component: <SampleComponent /> },
    {
      id: "tab2",
      icon: "marker",
      component: <Text size="body">Tab 2. Can be any react component</Text>,
    },
  ],
  selectedTab: "tab1",
};
