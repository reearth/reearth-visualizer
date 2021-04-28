import React, { useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { styled } from "@reearth/theme";
import L from "leaflet";
import { Map, TileLayer, Marker } from "react-leaflet";

import Icon from "@reearth/components/atoms/Icon";
import { BlockComponent } from "../../PluginBlock";
import { LatLng } from "@reearth/util/value";
import { Title } from "./common";
import LeafletMarker from "./leafletMarker";

import "leaflet/dist/leaflet.css";

const icon = L.divIcon({
  className: "custom-icon",
  html: ReactDOMServer.renderToString(<LeafletMarker />),
});

type Property = {
  default?: {
    location?: LatLng;
    title?: string;
    fullSize?: boolean;
  };
};

type PluginProperty = any;

const LocationBlock: BlockComponent<Property, PluginProperty> = ({
  property,
  infoboxProperty,
  onClick,
  onChange,
  isBuilt,
  isEditable,
  isHovered,
  isSelected,
}) => {
  const map = useRef<Map>(null);

  const location = property?.default?.location;
  const title = property?.default?.title;
  const fullSize = property?.default?.fullSize;
  const infoboxSize = infoboxProperty?.default?.size;
  const isTemplate = !location && !title;

  const handleChange = ({ lat, lng }: { lat: number; lng: number }) => {
    if (isBuilt || !isEditable) return;
    onChange?.("default", "location", { lat, lng }, "latlng");
  };

  const defaultCenter = { lat: 0, lng: 0 };

  return (
    <Wrapper
      fullSize={fullSize}
      onClick={onClick}
      isHovered={isHovered}
      isSelected={isSelected}
      isTemplate={isTemplate}
      isEditable={isEditable}>
      {title && <Title infoboxStyles={infoboxProperty}>{title}</Title>}
      {isTemplate && isEditable && (
        <Template>
          <StyledIcon icon={"location"} isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      )}
      {!isTemplate && (
        <StyledMap
          center={location ?? defaultCenter}
          zoom={13}
          ref={map}
          onclick={(e: React.MouseEvent<HTMLElement>) => handleChange((e.target as any).latlng)}
          title={title}
          isSelected={isSelected}
          isHovered={isHovered}
          infoboxSize={infoboxSize}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location && (
            <Marker
              icon={icon}
              position={location}
              draggable={!isBuilt && isEditable}
              ondragend={e => handleChange(e.target?.getLatLng())}
            />
          )}
        </StyledMap>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  fullSize?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate?: boolean;
  isEditable?: boolean;
}>`
  margin: ${({ fullSize }) => (fullSize ? "0" : "0 8px")};
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
      (!isTemplate && !isHovered && !isSelected) || !isEditable
        ? "transparent"
        : isHovered
        ? theme.infoBox.border
        : isSelected
        ? theme.infoBox.accent2
        : theme.infoBox.weakText};
  border-radius: 6px;
  height: 250px;
`;

const StyledMap = styled(Map)<any>`
  width: 100%;
  height: ${props =>
    props.infoboxSize === "large"
      ? props.title
        ? "236px"
        : "250px"
      : props.title
      ? "232px"
      : "250px"};
  overflow: hidden;
  z-index: 1;
  border-radius: ${({ isSelected, isHovered }) => (isHovered || isSelected ? "6px" : 0)};
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 250px;
  margin: 0 auto;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default LocationBlock;
