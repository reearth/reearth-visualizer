import type { Meta, StoryObj } from "@storybook/react";

import { TextInput, Selector } from "@reearth/app/lib/reearth-ui";
import { Badge } from "@reearth/app/ui/components";
import WarningBanner from "@reearth/app/ui/components/WarningBanner";

import CommonField from "./index";

const meta: Meta<typeof CommonField> = {
  component: CommonField,
  title: "App/UI/Fields/CommonField",
  parameters: {
    layout: "padded"
  }
};

export default meta;

type Story = StoryObj<typeof CommonField>;

export const Default: Story = {
  args: {
    title: "Field Title",
    description: "This is a description of the field",
    children: <TextInput placeholder="Enter value..." />
  }
};

export const WithTitleAdornment: Story = {
  args: {
    title: "Experimental Feature",
    titleAdornment: <Badge variant="warning">Experimental</Badge>,
    description: "This feature is experimental and may change",
    children: <TextInput placeholder="Enter value..." />
  }
};

export const WithWarning: Story = {
  args: {
    title: "Tile Type",
    beforeInput: (
      <WarningBanner>
        Cesium Ion access token is required for this tile type
      </WarningBanner>
    ),
    description: "Select the map tile provider",
    children: (
      <Selector
        options={[
          { label: "Default", value: "default" },
          { label: "Cesium Ion", value: "cesium-ion" },
          { label: "OpenStreetMap", value: "osm" }
        ]}
        value="cesium-ion"
      />
    )
  }
};

export const WithHelperText: Story = {
  args: {
    title: "API Key",
    afterInput: (
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        💡 Your API key will be encrypted and stored securely
      </div>
    ),
    description: "Enter your API key for external services",
    children: <TextInput type="password" placeholder="API key..." />
  }
};

export const AllDecorations: Story = {
  args: {
    title: "Advanced Setting",
    titleAdornment: <Badge variant="info">Beta</Badge>,
    beforeInput: (
      <WarningBanner>
        Changing this setting may affect performance
      </WarningBanner>
    ),
    afterInput: (
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        ℹ️ Recommended value: 1000
      </div>
    ),
    description: "Configure advanced performance settings",
    children: <TextInput type="number" value="1000" />
  }
};

export const MultipleBadges: Story = {
  args: {
    title: "Status Badges",
    titleAdornment: (
      <div style={{ display: "flex", gap: "8px" }}>
        <Badge variant="info">New</Badge>
        <Badge variant="warning">Experimental</Badge>
      </div>
    ),
    description: "Field with multiple status indicators",
    children: <TextInput placeholder="Enter value..." />
  }
};

export const ErrorState: Story = {
  args: {
    title: "Configuration",
    beforeInput: (
      <div style={{
        padding: "12px",
        backgroundColor: "#fee",
        border: "1px solid #fcc",
        borderRadius: "4px",
        color: "#c33",
        fontSize: "14px"
      }}>
        ⚠️ Invalid configuration detected
      </div>
    ),
    description: "Fix the errors below to continue",
    children: <TextInput placeholder="Enter value..." />
  }
};

export const SuccessState: Story = {
  args: {
    title: "Verified Email",
    titleAdornment: <Badge variant="success">Verified</Badge>,
    afterInput: (
      <div style={{ fontSize: "12px", color: "#0a0", marginTop: "4px" }}>
        ✓ Email address has been verified
      </div>
    ),
    children: <TextInput value="user@example.com" disabled />
  }
};
