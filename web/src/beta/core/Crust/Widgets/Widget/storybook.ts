import { actions } from "@storybook/addon-actions";

import type { Context } from ".";

export const contextEvents: Context = {
  ...actions<PickString<keyof Context>>({
    onCameraOrbit: "onCameraOrbit",
    onCameraRotateRight: "onCameraRotateRight",
    onFlyTo: "onFlyTo",
    onLayerSelect: "onLayerSelect",
    onLookAt: "onLookAt",
    onPause: "onPause",
    onPlay: "onPlay",
    onSpeedChange: "onSpeedChange",
    onTick: "onTick",
    onTimeChange: "onTimeChange",
    onZoomIn: "onZoomIn",
    onZoomOut: "onZoomOut",
  }),
};

type PickString<T> = T extends `on${string}` ? T : never;
