import L from "leaflet";
import React, { useMemo, useCallback, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { styled } from "@reearth/theme";

import { CommonProps as BlockProps, LatLng } from "..";
import { Border, Title } from "../utils";

import iconSvg from "./icon.svg?raw";

export type Props = BlockProps<Property>;

export type Property = {
  location?: LatLng;
  title?: string;
  fullSize?: boolean;
};

const defaultCenter = { lat: 0, lng: 0 };

export default function LocationBlock({
  block,
  infoboxProperty,
  isBuilt,
  isSelected,
  isEditable,
  onClick,
  onChange,
}: Props): JSX.Element {
  const { location, title, fullSize } = block?.property ?? {};
  const { size: infoboxSize } = infoboxProperty ?? {};

  const handleChange = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (isBuilt || !isEditable) return;
      onChange?.("default", "location", { lat, lng }, "latlng");
    },
    [isBuilt, isEditable, onChange],
  );

  const [isHovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick],
  );

  const markerRef = useRef<L.Marker<any>>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          handleChange(marker.getLatLng());
        }
      },
    }),
    [handleChange],
  );

  return (
    <Wrapper
      fullSize={fullSize}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isHovered={isHovered}
      isEditable={isEditable}
      isSelected={isSelected}>
      {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
      <MapContainer
        style={{
          height: infoboxSize === "large" ? (title ? "236px" : "250px") : title ? "232px" : "250px",
          overflow: "hidden",
          zIndex: 1,
        }}
        center={location ?? defaultCenter}
        zoom={13}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {location && (
          <Marker
            icon={icon}
            position={location}
            draggable={!isBuilt && isEditable}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
        )}
      </MapContainer>
    </Wrapper>
  );
}

const Wrapper = styled(Border)<{
  fullSize?: boolean;
}>`
  margin: ${({ fullSize }) => (fullSize ? "0" : "0 8px")};
  border-radius: 6px;
  height: 250px;
  color: #000000;
`;

const icon = L.divIcon({
  className: "custom-icon",
  html: iconSvg,
});
