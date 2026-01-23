import { Meta, StoryObj } from "@storybook/react-vite";

import { CodeInput, CodeInputProps } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<CodeInputProps> = {
  component: CodeInput
};

export default meta;
type Story = StoryObj<typeof CodeInput>;

const TEST_JSON = {
  name: "Eukarya",
  application: "reearth",
  component: "CodeInput"
};

export const Default: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={fn()}
        onBlur={fn()}
      />
    </div>
  )
};

export const Disabled: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={fn()}
        onBlur={fn()}
        disabled={true}
      />
    </div>
  )
};

export const HideLineNumber: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value={JSON.stringify(TEST_JSON)}
        onChange={fn()}
        onBlur={fn()}
        showLines={false}
      />
    </div>
  )
};

export const JavascriptInput: Story = {
  render: () => (
    <div style={{ height: "500px", width: "300px" }}>
      <CodeInput
        value="console.log('codeinput')"
        onChange={fn()}
        onBlur={fn()}
        language="javascript"
      />
    </div>
  )
};
