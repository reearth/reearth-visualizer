import { Meta, StoryObj } from "@storybook/react-vite";

import { Banner, BannerProps } from ".";

const meta: Meta<BannerProps> = {
  component: Banner,
  title: "App/Lib/reearth-ui/components/Banner",
  parameters: {
    layout: "padded"
  }
};

export default meta;

type Story = StoryObj<BannerProps>;

export const Info: Story = {
  args: {
    variant: "info",
    children:
      "This is an informational message that provides helpful context to the user."
  }
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children:
      "This is a warning message that alerts the user to important information."
  }
};

export const Error: Story = {
  args: {
    variant: "error",
    children: "This is an error message indicating something went wrong."
  }
};

export const Success: Story = {
  args: {
    variant: "success",
    children:
      "This is a success message confirming an action completed successfully."
  }
};

export const LongMessage: Story = {
  args: {
    variant: "info",
    children:
      "This is a longer message to demonstrate how the banner handles multiple lines of text. The banner will automatically wrap the content and maintain proper spacing and alignment with the icon."
  }
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Banner variant="info">
        This is an informational message that provides helpful context to the
        user.
      </Banner>
      <Banner variant="warning">
        This is a warning message that alerts the user to important information.
      </Banner>
      <Banner variant="error">
        This is an error message indicating something went wrong.
      </Banner>
      <Banner variant="success">
        This is a success message confirming an action completed successfully.
      </Banner>
    </div>
  )
};
