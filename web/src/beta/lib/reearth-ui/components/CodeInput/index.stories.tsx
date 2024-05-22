import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { CodeInput, CodeInputProps } from ".";

const meta: Meta<CodeInputProps> = {
  component: CodeInput,
};

export default meta;
type Story = StoryObj<typeof CodeInput>;

const TEST_JSON = {
  name: "Eukarya",
  application: "reearth",
  component: "CodeInput",
};

export const Default: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={action("changed-value")}
        onBlur={action("on-blur")}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={action("changed-value")}
        onBlur={action("on-blur")}
        disabled={true}
      />
    </div>
  ),
};

export const HideLineNumber: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={action("changed-value")}
        onBlur={action("on-blur")}
        showLines={false}
      />
    </div>
  ),
};

export const JavascriptInput: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value="console.log('codeinput')"
        onChange={action("changed-value")}
        onBlur={action("on-blur")}
        language="js"
      />
    </div>
  ),
};
