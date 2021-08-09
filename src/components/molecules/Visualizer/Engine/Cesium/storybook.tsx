import React from "react";
import { CameraFlyTo, CameraFlyToBoundingSphere } from "resium";
import { BoundingSphere, Cartesian3 } from "cesium";
import { action } from "@storybook/addon-actions";

import { Provider } from "../../context";
import { context } from "../../storybook";
import CesiumEngine from ".";
import { SceneProperty } from "..";

export type { SceneProperty } from "..";

export const location = { lat: 35.652832, lng: 139.839478, height: 1000 };

// For storybook
export const V: React.FC<{
  location?: { lat: number; lng: number };
  lookAt?: { lat: number; lng: number; height: number; range: number };
  property?: SceneProperty;
}> = ({ children, location: l = location, lookAt, property }) => {
  return (
    <Provider value={context}>
      <CesiumEngine
        ready
        property={{
          ...property,
          tiles: property?.tiles ?? [{ id: "default", tile_type: "default" }],
        }}
        onPrimitiveSelect={action("Cesium: onLayerSelect")}>
        {lookAt ? (
          <CameraFlyToBoundingSphere
            boundingSphere={
              new BoundingSphere(
                Cartesian3.fromDegrees(lookAt.lng, lookAt.lat, lookAt.height),
                lookAt.range,
              )
            }
            duration={0}
            once
          />
        ) : (
          <CameraFlyTo
            destination={Cartesian3.fromDegrees((l ?? location).lng, (l ?? location).lat, 10000)}
            duration={0}
            once
          />
        )}
        {children}
      </CesiumEngine>
    </Provider>
  );
};
