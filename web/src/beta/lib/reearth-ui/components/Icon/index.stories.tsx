import { Meta, StoryObj } from "@storybook/react";

import IconList from "./icons";

import { Icon, IconProps, IconName } from ".";

const meta: Meta<IconProps> = {
  component: Icon
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const AllIcons: Story = {
  render: () => (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          width: "500px",
          marginBottom: "20px"
        }}
      >
        {Object.keys(IconList).map((iconName) => {
          const typedIconName = iconName as IconName;
          return (
            <div
              key={iconName}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                cursor: "pointer"
              }}
              title={iconName}
              onClick={() => copyToClipboard(iconName)}
            >
              <Icon icon={typedIconName} />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          width: "500px"
        }}
      >
        {Object.keys(IconList).map((iconName) => {
          const typedIconName = iconName as IconName;
          return (
            <div
              key={iconName}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                cursor: "pointer"
              }}
              title={iconName}
              onClick={() => copyToClipboard(iconName)}
            >
              <Icon icon={typedIconName} size="large" color="#ff0000" />
            </div>
          );
        })}
      </div>
    </>
  )
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
