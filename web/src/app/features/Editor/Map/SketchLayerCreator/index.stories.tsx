import { Meta, StoryObj } from "@storybook/react";

import SketchLayerCreator from ".";

const meta: Meta<typeof SketchLayerCreator> = { component: SketchLayerCreator };
export default meta;
type Story = StoryObj<typeof SketchLayerCreator>;
export const Default: Story = { args: {} };
