import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps, FC, useEffect, useState } from "react";

import { useVisualizer } from "./context";

import Component from ".";

export default {
  component: Component,
} as Meta;

type Story = StoryObj<typeof Component>;

export const Cesium: Story = {
  args: {
    ready: true,
    engine: "cesium",
    sceneProperty: {
      tiles: [
        {
          id: "default",
          tile_type: "default",
        },
      ],
    },
  },
};

const Content: FC<{ ready?: boolean }> = ({ ready }) => {
  const visualizer = useVisualizer();
  useEffect(() => {
    if (!ready) return;
    visualizer.current?.engine.flyTo({
      lat: 35.683252649879606,
      lng: 139.75262379931652,
      height: 5000,
    });
    visualizer.current?.layers.add({
      type: "simple",
      data: {
        type: "geojson",
        value: {
          // GeoJSON
          type: "Feature",
          geometry: {
            coordinates: [139.75262379931652, 35.683252649879606, 1000],
            type: "Point",
          },
        },
      },
      marker: {
        imageColor: "blue",
      },
    });
  }, [visualizer, ready]);
  return null;
};

const VisualizerWrapper: FC<ComponentProps<typeof Component>> = props => {
  const [ready, setReady] = useState(false);
  return (
    <Component {...props} onMount={() => setReady(true)}>
      <Content ready={ready} />
    </Component>
  );
};

export const API: Story = {
  render: args => {
    return <VisualizerWrapper {...args} />;
  },
  args: {
    ready: true,
    engine: "cesium",
    sceneProperty: {
      tiles: [
        {
          id: "default",
          tile_type: "default",
        },
      ],
    },
  },
};

export const Plugin = {
  args: {
    ready: true,
    engine: "cesium",
    sceneProperty: {
      tiles: [
        {
          id: "default",
          tile_type: "default",
        },
      ],
    },
    widgetAlignSystem: {
      outer: {
        left: {
          top: {
            align: "start",
            widgets: [
              {
                id: "plugin",
                pluginId: "plugin",
                extensionId: "test",
                ...({
                  __REEARTH_SOURCECODE: `reearth.layers.add(${JSON.stringify({
                    id: "l",
                    type: "simple",
                    data: {
                      type: "geojson",
                      value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
                    },
                    marker: {
                      imageColor: "#fff",
                    },
                  })});`,
                } as any),
              },
            ],
          },
        },
      },
    },
  },
};
