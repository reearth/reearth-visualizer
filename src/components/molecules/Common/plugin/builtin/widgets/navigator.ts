import { useEffect } from "react";
import { useCesium } from "resium";

import { WidgetComponent } from "../../PluginWidget";
import { PluginProperty } from ".";

type Property = {};

const Navigator: WidgetComponent<Property, PluginProperty> = () => {
  const cesiumViewer = useCesium().viewer;
  useEffect(() => {
    const mixin = (window as any).Cesium?.viewerCesiumNavigationMixin;
    if (cesiumViewer && mixin && !cesiumViewer.isDestroyed()) {
      cesiumViewer.extend(mixin, {});
    }
    // TODO: 一度extendすると消すことができない
  }, [cesiumViewer]);
  return null;
};

export default Navigator;
