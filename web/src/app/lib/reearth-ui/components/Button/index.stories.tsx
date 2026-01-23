import { Meta, StoryObj } from "@storybook/react-vite";

import { Button, ButtonProps } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<ButtonProps> = {
  component: Button
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Secondary" onClick={fn()} />
      <Button
        title="Secondary Small"
        size="small"
        onClick={fn()}
      />
      <Button title="Secondary Disabled" disabled={true} />
      <Button
        title="Secondary Icon Button"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={fn()}
      />
      <Button
        title="Secondary Extend"
        extendWidth={true}
        onClick={fn()}
      />
      <Button
        title="Secondary Min Width(300)"
        minWidth={300}
        onClick={fn()}
      />
      <Button
        iconButton={true}
        icon="settingFilled"
        onClick={fn()}
      />
      <Button
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={fn()}
      />
    </div>
  )
};

export const Primary: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button
        title="Primary"
        appearance="primary"
        onClick={fn()}
      />
      <Button
        title="Primary Small"
        appearance="primary"
        size="small"
        onClick={fn()}
      />
      <Button
        title="Primary Disabled"
        appearance="primary"
        disabled={true}
        onClick={fn()}
      />
      <Button
        title="Primary Icon Button"
        appearance="primary"
        icon="settingFilled"
        onClick={fn()}
        iconRight="caretDown"
      />
      <Button
        title="Primary Extend"
        appearance="primary"
        extendWidth={true}
        onClick={fn()}
      />
      <Button
        title="Primary Min Width(300)"
        appearance="primary"
        minWidth={300}
        onClick={fn()}
      />
      <Button
        appearance="primary"
        iconButton={true}
        icon="settingFilled"
        onClick={fn()}
      />
      <Button
        appearance="primary"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={fn()}
      />
    </div>
  )
};

export const Dangerous: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button
        title="Dangerous"
        appearance="dangerous"
        onClick={fn()}
      />
      <Button
        title="Dangerous Small"
        appearance="dangerous"
        size="small"
        onClick={fn()}
      />
      <Button
        title="Dangerous Disabled"
        appearance="dangerous"
        disabled={true}
        onClick={fn()}
      />
      <Button
        title="Dangerous Icon Button"
        appearance="dangerous"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={fn()}
      />
      <Button
        title="Dangerous Extend"
        appearance="dangerous"
        extendWidth={true}
        onClick={fn()}
      />
      <Button
        title="Dangerous Min Width(300)"
        appearance="dangerous"
        minWidth={300}
        onClick={fn()}
      />
      <Button
        appearance="dangerous"
        iconButton={true}
        icon="settingFilled"
        onClick={fn()}
      />
      <Button
        appearance="dangerous"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={fn()}
      />
    </div>
  )
};

export const Simple: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button
        title="Simple"
        appearance="simple"
        onClick={fn()}
      />
      <Button
        title="Simple Small"
        appearance="simple"
        size="small"
        onClick={fn()}
      />
      <Button
        title="Simple Disabled"
        appearance="simple"
        disabled={true}
        onClick={fn()}
      />
      <Button
        title="Simple Icon Button"
        appearance="simple"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={fn()}
      />
      <Button
        title="Simple Extend"
        appearance="simple"
        extendWidth={true}
        onClick={fn()}
      />
      <Button
        title="Simple Min Width(300)"
        appearance="simple"
        minWidth={300}
        onClick={fn()}
      />
      <Button
        appearance="simple"
        iconButton={true}
        icon="settingFilled"
        onClick={fn()}
      />
      <Button
        appearance="simple"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={fn()}
      />
    </div>
  )
};
