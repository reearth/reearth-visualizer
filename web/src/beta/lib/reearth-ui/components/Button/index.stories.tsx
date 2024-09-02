import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonProps } from ".";

const meta: Meta<ButtonProps> = {
  component: Button
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Secondary" onClick={action("secondary-click")} />
      <Button
        title="Secondary Small"
        size="small"
        onClick={action("secondary-small-click")}
      />
      <Button title="Secondary Disabled" disabled={true} />
      <Button
        title="Secondary Icon Button"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={action("secondary-icon-button-click")}
      />
      <Button
        title="Secondary Extend"
        extendWidth={true}
        onClick={action("secondary-extend-click")}
      />
      <Button
        title="Secondary Min Width(300)"
        minWidth={300}
        onClick={action("secondary-min-width-click")}
      />
      <Button
        iconButton={true}
        icon="settingFilled"
        onClick={action("secondary-icon-click")}
      />
      <Button
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={action("secondary-icon-small-click")}
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
        onClick={action("primary-click")}
      />
      <Button
        title="Primary Small"
        appearance="primary"
        size="small"
        onClick={action("primary-small-click")}
      />
      <Button
        title="Primary Disabled"
        appearance="primary"
        disabled={true}
        onClick={action("primary-disabled-click")}
      />
      <Button
        title="Primary Icon Button"
        appearance="primary"
        icon="settingFilled"
        onClick={action("primary-icon-button-click")}
        iconRight="caretDown"
      />
      <Button
        title="Primary Extend"
        appearance="primary"
        extendWidth={true}
        onClick={action("primary-extend-click")}
      />
      <Button
        title="Primary Min Width(300)"
        appearance="primary"
        minWidth={300}
        onClick={action("primary-min-width-click")}
      />
      <Button
        appearance="primary"
        iconButton={true}
        icon="settingFilled"
        onClick={action("primary-icon-click")}
      />
      <Button
        appearance="primary"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={action("primary-icon-small-click")}
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
        onClick={action("dangerous-click")}
      />
      <Button
        title="Dangerous Small"
        appearance="dangerous"
        size="small"
        onClick={action("dangerous-small-click")}
      />
      <Button
        title="Dangerous Disabled"
        appearance="dangerous"
        disabled={true}
        onClick={action("dangerous-disabled-click")}
      />
      <Button
        title="Dangerous Icon Button"
        appearance="dangerous"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={action("dangerous-icon-button-click")}
      />
      <Button
        title="Dangerous Extend"
        appearance="dangerous"
        extendWidth={true}
        onClick={action("dangerous-extend-click")}
      />
      <Button
        title="Dangerous Min Width(300)"
        appearance="dangerous"
        minWidth={300}
        onClick={action("dangerous-min-width-click")}
      />
      <Button
        appearance="dangerous"
        iconButton={true}
        icon="settingFilled"
        onClick={action("dangerous-icon-click")}
      />
      <Button
        appearance="dangerous"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={action("dangerous-icon-small-click")}
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
        onClick={action("simple-click")}
      />
      <Button
        title="Simple Small"
        appearance="simple"
        size="small"
        onClick={action("simple-small-click")}
      />
      <Button
        title="Simple Disabled"
        appearance="simple"
        disabled={true}
        onClick={action("simple-disabled-click")}
      />
      <Button
        title="Simple Icon Button"
        appearance="simple"
        icon="settingFilled"
        iconRight="caretDown"
        onClick={action("simple-icon-button-click")}
      />
      <Button
        title="Simple Extend"
        appearance="simple"
        extendWidth={true}
        onClick={action("simple-extend-click")}
      />
      <Button
        title="Simple Min Width(300)"
        appearance="simple"
        minWidth={300}
        onClick={action("simple-min-width-click")}
      />
      <Button
        appearance="simple"
        iconButton={true}
        icon="settingFilled"
        onClick={action("simple-icon-click")}
      />
      <Button
        appearance="simple"
        iconButton={true}
        icon="settingFilled"
        size="small"
        onClick={action("simple-icon-small-click")}
      />
    </div>
  )
};
