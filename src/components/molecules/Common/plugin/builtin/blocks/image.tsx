import React from "react";
import { styled } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import { Title } from "./common";

import { BlockComponent } from "../../PluginBlock";

type Property = {
  default?: {
    image?: string;
    title?: string;
    fullSize?: boolean;
    imageSize?: "contain" | "cover";
    imagePositionX?: "left" | "center" | "right";
    imagePositionY?: "top" | "center" | "bottom";
  };
};

const ImageBlock: BlockComponent<Property> = ({
  property,
  infoboxProperty,
  onClick,
  isHovered,
  isSelected,
  isEditable,
}) => {
  const title = property?.default?.title;
  const fullSize = property?.default?.fullSize;
  const src = property?.default?.image;
  const imageSize = property?.default?.imageSize;
  const imagePositionX = property?.default?.imagePositionX;
  const imagePositionY = property?.default?.imagePositionY;
  const infoboxSize = infoboxProperty?.default?.size;
  const isTemplate = !src && !title;

  return (
    <Wrapper
      onClick={onClick}
      fullSize={fullSize}
      isSelected={isSelected}
      isHovered={isHovered}
      isTemplate={isTemplate}
      isEditable={isEditable}
      infoboxSize={infoboxSize}>
      {title && <Title infoboxStyles={infoboxProperty}>{title}</Title>}
      {isTemplate && isEditable ? (
        <Template infoboxSize={infoboxSize}>
          <StyledIcon icon="photooverlay" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <Image
          src={src}
          fullSize={fullSize}
          imageSize={imageSize}
          imagePositionX={imagePositionX}
          imagePositionY={imagePositionY}
          isSelected={isSelected}
          isHovered={isHovered}
          name={title}
          infoboxSize={infoboxSize}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  fullSize?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
  infoboxSize?: string;
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
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
`;

const Image = styled.img<{
  fullSize?: boolean;
  imageSize?: "contain" | "cover";
  imagePositionX?: "left" | "center" | "right";
  imagePositionY?: "top" | "center" | "bottom";
  isHovered?: boolean;
  isSelected?: boolean;
  name?: string;
  infoboxSize?: string;
}>`
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: ${props =>
    props.infoboxSize === "large"
      ? props.name
        ? "326px"
        : "340px"
      : props.name
      ? "181px"
      : "200px"};
  object-fit: ${({ imageSize }) => imageSize || "cover"};
  object-position: ${({ imagePositionX, imagePositionY }) =>
    `${imagePositionX || "center"} ${imagePositionY || "center"}`};
  outline: none;
  border-radius: ${({ isSelected, isHovered }) => (isHovered || isSelected ? "6px" : 0)};
`;

const Template = styled.div<{ infoboxSize?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default ImageBlock;
