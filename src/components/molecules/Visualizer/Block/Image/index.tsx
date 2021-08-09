import React, { useCallback, useState } from "react";
import { styled } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import { Border, Title } from "../common";
import { Props as BlockProps } from "..";

export type Props = BlockProps<Property>;

export type Property = {
  default?: {
    image?: string;
    title?: string;
    fullSize?: boolean;
    imageSize?: "contain" | "cover";
    imagePositionX?: "left" | "center" | "right";
    imagePositionY?: "top" | "center" | "bottom";
  };
};

const ImageBlock: React.FC<Props> = ({
  block,
  infoboxProperty,
  onClick,
  isSelected,
  isEditable,
}) => {
  const {
    title,
    fullSize,
    image: src,
    imageSize,
    imagePositionX,
    imagePositionY,
  } = (block?.property as Property | undefined)?.default ?? {};
  const { size: infoboxSize } = infoboxProperty?.default ?? {};
  const isTemplate = !src && !title;

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

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      fullSize={fullSize}
      infoboxSize={infoboxSize}
      isHovered={isHovered}
      isEditable={isEditable}
      isSelected={isSelected}>
      {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
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
          name={title}
          infoboxSize={infoboxSize}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Border)<{
  fullSize?: boolean;
  infoboxSize?: string;
}>`
  margin: ${({ fullSize }) => (fullSize ? "0" : "0 8px")};
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
