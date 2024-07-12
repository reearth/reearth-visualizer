import { Meta, Story } from "@storybook/react";

import Text, { Props } from ".";

export default {
  component: Text,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const markdownText = `
# Hello
This is **markdown**.
## H2
### H3
#### H4
##### H5
`;

const Template: Story<Props> = args => <Text {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { text: "aaaaaa" } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Title = Template.bind({});
Title.args = {
  block: { id: "", property: { text: "aaaaaa", title: "Title" } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Markdown = Template.bind({});
Markdown.args = {
  block: { id: "", property: { text: markdownText, markdown: true } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Typography = Template.bind({});
Typography.args = {
  block: {
    id: "",
    property: {
      text: markdownText,
      markdown: true,
      typography: { color: "red", fontSize: 16 },
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const NoText = Template.bind({});
NoText.args = {
  isSelected: false,
  isBuilt: false,
  isEditable: true,
};
