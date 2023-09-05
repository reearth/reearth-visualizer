import { Meta, StoryObj } from "@storybook/react";

import type { NLSLayer } from "@reearth/services/api/layersApi/utils";

import Layers from ".";

function LeftPanelLayers() {
  const layers: NLSLayer[] = [
    { id: "layer1", title: "blah", visible: true, layerType: "simple", tags: [] },
    { id: "layer2", title: "blehbleh", visible: true, layerType: "simple", tags: [] },
    { id: "layer3", title: "blah", visible: true, layerType: "Hehehah", tags: [] },
  ];

  return (
    <Layers
      layers={layers}
      onLayerDelete={(_id: string) => {}}
      onLayerSelect={(_id: string) => {}}
    />
  );
}

const meta: Meta<typeof LeftPanelLayers> = {
  component: LeftPanelLayers,
};

export default meta;

type Story = StoryObj<typeof LeftPanelLayers>;

export const Default: Story = {
  render: _args => {
    return (
      <div>
        <LeftPanelLayers />
      </div>
    );
  },
};
