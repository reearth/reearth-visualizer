import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Text from "./text";

const markdownText = `
# Hello

This is **markdown**.

## H2

### H3

#### H4

##### H5
`;

export default {
  title: "molecules/Common/plugin/builtin/blocks/Text",
  component: Text,
} as Meta;

export const Default = () => <Text property={{ default: { text: "aaaaaa" } }} />;
export const Title = () => <Text property={{ default: { text: "aaaaaa", title: "Title" } }} />;
export const Markdown = () => (
  <Text property={{ default: { text: markdownText, markdown: true } }} />
);
export const Typography = () => (
  <Text
    property={{
      default: { text: markdownText, markdown: true, typography: { color: "red", fontSize: 16 } },
    }}
  />
);
export const Selected = () => (
  <Text isSelected property={{ default: { text: markdownText, markdown: true } }} />
);
export const Editable = () => (
  <Text
    isSelected
    isEditable
    property={{ default: { text: markdownText, markdown: true } }}
    onChange={action("onChange")}
  />
);
export const Built = () => (
  <Text isBuilt property={{ default: { text: markdownText, markdown: true } }} />
);
