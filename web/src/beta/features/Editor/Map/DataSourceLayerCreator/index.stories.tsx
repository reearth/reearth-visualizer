import { Meta, StoryObj } from "@storybook/react";

import DataSourceLayerCreator from ".";

const meta: Meta<typeof DataSourceLayerCreator> = { component: DataSourceLayerCreator };
export default meta;
type Story = StoryObj<typeof DataSourceLayerCreator>;
export const Default: Story = { args: {} };
