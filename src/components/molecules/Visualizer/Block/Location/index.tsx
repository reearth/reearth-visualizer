import L from "leaflet";
import React, { useMemo, useCallback, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import { styled } from "@reearth/theme";
import { LatLng } from "@reearth/util/value";

import { Props as BlockProps } from "..";
import { Border, Title } from "../common";

import "leaflet/dist/leaflet.css";

export type Props = BlockProps<Property>;

export type Property = {
  default?: {
    location?: LatLng;
    title?: string;
    fullSize?: boolean;
  };
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
  const { location, title, fullSize } = (block?.property as Property | undefined)?.default ?? {};
  const { size: infoboxSize } = infoboxProperty?.default ?? {};

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

const iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd"
  d="M14.0292 22.7354C15.1183 21.8682 16.207 20.8883 17.226 19.8127C20.1976 16.676 22 13.3716 22 10C22 4.47715 17.5228 0 12 0C6.47715 0 2 4.47715 2 10C2 13.3716 3.8024 16.676 6.77405 19.8127C7.793 20.8883 8.88175 21.8682 9.97082 22.7354C10.3526 23.0394 10.7078 23.3081 11.0278 23.5392C11.2228 23.68 11.3649 23.7784 11.4453 23.8321C11.7812 24.056 12.2188 24.056 12.5547 23.8321C12.6351 23.7784 12.7772 23.68 12.9722 23.5392C13.2922 23.3081 13.6474 23.0394 14.0292 22.7354ZM15.774 18.4373C14.8242 19.4398 13.8036 20.3584 12.7833 21.1708C12.5048 21.3926 12.2423 21.5936 12 21.7726C11.7577 21.5936 11.4952 21.3926 11.2167 21.1708C10.1964 20.3584 9.17575 19.4398 8.22595 18.4373C5.5726 15.6365 4 12.7534 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 12.7534 18.4274 15.6365 15.774 18.4373ZM12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
  fill="#00A0E8" />
<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="2" y="0" width="20" height="24">
  <path fillRule="evenodd" clipRule="evenodd"
    d="M14.0292 22.7354C15.1183 21.8682 16.207 20.8883 17.226 19.8127C20.1976 16.676 22 13.3716 22 10C22 4.47715 17.5228 0 12 0C6.47715 0 2 4.47715 2 10C2 13.3716 3.8024 16.676 6.77405 19.8127C7.793 20.8883 8.88175 21.8682 9.97082 22.7354C10.3526 23.0394 10.7078 23.3081 11.0278 23.5392C11.2228 23.68 11.3649 23.7784 11.4453 23.8321C11.7812 24.056 12.2188 24.056 12.5547 23.8321C12.6351 23.7784 12.7772 23.68 12.9722 23.5392C13.2922 23.3081 13.6474 23.0394 14.0292 22.7354ZM15.774 18.4373C14.8242 19.4398 13.8036 20.3584 12.7833 21.1708C12.5048 21.3926 12.2423 21.5936 12 21.7726C11.7577 21.5936 11.4952 21.3926 11.2167 21.1708C10.1964 20.3584 9.17575 19.4398 8.22595 18.4373C5.5726 15.6365 4 12.7534 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 12.7534 18.4274 15.6365 15.774 18.4373ZM12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
    fill="#00A0E8" />
</mask>
<g mask="url(#mask0)">
  <rect width="24" height="24" fill="#00A0E8" />
</g>
</svg>`;

const icon = L.divIcon({
  className: "custom-icon",
  html: iconSvg,
});
