import type { Meta, StoryObj } from "@storybook/react";

import { TextInput, Selector, Banner } from "@reearth/app/lib/reearth-ui";
import { Badge } from "@reearth/app/ui/components";

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

export const WithWarningBanner: Story = {
  args: {
    title: "Tile Type",
    beforeInput: (
      <Banner variant="warning">
        Cesium Ion token not set, fallback will be used.
      </Banner>
    ),
    description: "Select the map tile provider",
    children: (
      <Selector
        options={[
          { label: "Default", value: "default" },
          { label: "Cesium Ion", value: "cesium_ion" },
          { label: "OpenStreetMap", value: "osm" }
        ]}
        value="cesium_ion"
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
      <Banner variant="warning">
        Changing this setting may affect performance
      </Banner>
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

export const WithInfoBanner: Story = {
  args: {
    title: "Data Source",
    beforeInput: (
      <Banner variant="info">
        This field accepts URLs from trusted data sources only
      </Banner>
    ),
    description: "Enter the data source URL",
    children: <TextInput placeholder="https://example.com/data" />
  }
};

export const WithErrorBanner: Story = {
  args: {
    title: "Configuration",
    beforeInput: (
      <Banner variant="error">
        Invalid configuration detected. Please check your settings.
      </Banner>
    ),
    description: "Fix the errors below to continue",
    children: <TextInput placeholder="Enter value..." />
  }
};

export const WithSuccessBanner: Story = {
  args: {
    title: "Verified Email",
    titleAdornment: <Badge variant="success">Verified</Badge>,
    afterInput: (
      <Banner variant="success">
        Email address has been successfully verified
      </Banner>
    ),
    children: <TextInput value="user@example.com" disabled />
  }
};
