import { Meta, StoryObj } from "@storybook/react";
import { t } from "i18next";

import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";

import Layers from ".";

function LeftPanel() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groups = [
    {
      schemaGroupId: "scene",
      title: "Scene",
    },
    {
      schemaGroupId: "layers",
      title: "Layers",
    },
  ];

  const layers: NLSLayer[] = [
    { id: "layer1", title: "blah", visible: true, layerType: "simple", tags: [] },
    { id: "layer2", title: "blehbleh", visible: true, layerType: "simple", tags: [] },
    { id: "layer3", title: "blah", visible: true, layerType: "Hehehah", tags: [] },
  ];

  return (
    <div style={{ maxWidth: "262px", height: "100vh" }}>
      <SidePanelCommon
        location="left"
        contents={[
          {
            id: "outline",
            title: t("Outline"),
            children: (
              <div>
                <SidePanelSectionField title="Layers">
                  <Layers
                    layers={layers}
                    onLayerDelete={(_id: string) => {}}
                    onLayerSelect={(_id: string) => {}}
                  />
                </SidePanelSectionField>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

const meta: Meta<typeof LeftPanel> = {
  component: LeftPanel,
};

export default meta;

type Story = StoryObj<typeof LeftPanel>;

export const Default: Story = {
  render: _args => {
    return (
      <div>
        <LeftPanel />
      </div>
    );
  },
};
