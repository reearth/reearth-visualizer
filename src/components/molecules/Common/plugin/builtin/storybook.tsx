import React from "react";
import { Viewer, CameraFlyTo } from "resium";
import { Cartesian3 } from "cesium";

const dummy = document.createElement("div");

export const location = { lat: 35.652832, lng: 139.839478, height: 1000 };

// For storybook
export const V: React.FC<{ location?: { lat: number; lng: number } }> = ({
  children,
  location: l,
}) => (
  <Viewer
    full
    infoBox={false}
    animation={false}
    timeline={false}
    creditContainer={dummy}
    requestRenderMode
    maximumRenderTimeChange={Infinity}
    style={{ position: "fixed" }}>
    <CameraFlyTo
      destination={Cartesian3.fromDegrees((l ?? location).lng, (l ?? location).lat, 10000)}
      duration={0}
      once
    />
    {children}
  </Viewer>
);
