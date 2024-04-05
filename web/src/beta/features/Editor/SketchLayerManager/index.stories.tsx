import { Meta, StoryObj } from "@storybook/react";

import SketchLayerManager from ".";

const meta: Meta<typeof SketchLayerManager> = { component: SketchLayerManager };
export default meta;
type Story = StoryObj<typeof SketchLayerManager>;
export const Default: Story = { args: {} };
