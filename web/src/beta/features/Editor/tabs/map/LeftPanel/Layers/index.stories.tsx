import { Meta, StoryObj } from "@storybook/react";

import type {
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
} from "@reearth/beta/features/Editor/useLayers";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";

import Layers from ".";

function LeftPanelLayers() {
  const layers: NLSLayer[] = [
    { id: "layer1", title: "blah", visible: true, layerType: "simple" },
    { id: "layer2", title: "blehbleh", visible: true, layerType: "simple" },
    { id: "layer3", title: "blah", visible: true, layerType: "Hehehah" },
  ];

  return (
    <Layers
      layers={layers}
      onLayerDelete={(_id: string) => {}}
      onLayerNameUpdate={(_inp: LayerNameUpdateProps) => {}}
      onLayerSelect={(_id: string) => {}}
      onDataSourceManagerOpen={() => {}}
      onSketchLayerManagerOpen={() => {}}
      onLayerVisibilityUpate={(_inp: LayerVisibilityUpdateProps) => {}}
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
