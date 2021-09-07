import React, { useState } from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Component, { Layer, Widget } from ".";
import deepFind from "@reearth/util/deepFind";

export default {
  title: "molecules/EarthEditor/LayerPane",
  component: Component,
  argTypes: {
    onLayerRename: { action: "onLayerRename" },
    onLayerVisibilityChange: { action: "onLayerVisibilityChange" },
    onLayerRemove: { action: "onLayerRemove" },
    onLayerSelect: { action: "onLayerSelect" },
    onSceneSelect: { action: "onSceneSelect" },
    onWidgetSelect: { action: "onWidgetSelect" },
    onLayerMove: { action: "onLayerMove" },
    onLayerImport: { action: "onLayerImport" },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const widgets: Widget[] = [
  {
    id: "Widget1",
    pluginId: "xxx",
    extensionId: "yyy",
    title: "Widget1",
    enabled: true,
  },
];

const layers: Layer[] = [
  { id: "foobar", type: "item", title: "foobar" },
  {
    id: "hoge",
    title: "hoge",
    type: "group",
    children: [
      { id: "foo", type: "item", title: "foo" },
      { id: "bar", type: "item", title: "bar" },
    ],
  },
];

export const Default = () => {
  const [layersState, setLayers] = useState(layers);

  return (
    <Component
      rootLayerId="root"
      layers={layersState}
      widgets={widgets}
      onLayerMove={(src, dest, index, childrenCount, parent) => {
        action("onLayerMove")(src, dest, index, childrenCount, parent);

        const s = deepFind(
          layersState,
          l => l.id === src,
          l => (l.type === "group" ? l.children : undefined),
        )[0];
        const p = deepFind(
          layersState,
          l => l.id === parent,
          l => (l.type === "group" ? l.children : undefined),
        )[0];
        const d = deepFind(
          layersState,
          l => l.id === dest,
          l => (l.type === "group" ? l.children : undefined),
        )[0];
        if (!s || (p && p.type !== "group") || (d && d.type !== "group")) return;

        let newLayers = [...layersState];

        if (!p) {
          const srcIndex = newLayers?.findIndex(l => l.id === src) ?? -1;
          if (srcIndex >= 0) {
            newLayers.splice(srcIndex, 1);
          }
        } else {
          const srcIndex = p.children?.findIndex(l => l.id === src) ?? -1;
          if (srcIndex >= 0) {
            p?.children?.splice(srcIndex, 1);
          }
        }

        if (d) {
          d.children = [
            ...(d.children?.slice(0, index) ?? []),
            s,
            ...(d.children?.slice(index) ?? []),
          ];
        } else {
          newLayers = [...newLayers.slice(0, index), s, ...newLayers.slice(index)];
        }

        setLayers(newLayers);
      }}
    />
  );
};
