import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "atoms/accordion",
  component: Component,
} as Meta;

const SampleHeading = <div style={{ color: "white", background: "black" }}>heading</div>;

const SampleContent = (
  <div style={{ color: "white", background: "black", padding: "20px" }}>hoge</div>
);

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  items: [
    {
      id: "hoge",
      heading: SampleHeading,
      content: SampleContent,
    },
    {
      id: "hogefuga",
      heading: SampleHeading,
      content: SampleContent,
    },
  ],
};
