import { Meta } from "@storybook/react";

import ContentPicker, { Item } from ".";

export default {
  component: ContentPicker,
} as Meta;

const items: Item[] = [
  {
    id: "1",
    name: "2",
    icon: "crosshair",
  },
  {
    id: "1",
    name: "2",
    icon: "crosshair",
  },
];
export const Default = () => <ContentPicker items={items} />;
