import React, { useMemo } from "react";
import { Entity, BillboardGraphics } from "resium";
import { Cartesian3 } from "cesium";
import nl2br from "react-nl2br";

import { styled, useTheme } from "@reearth/theme";
import { Camera, LatLng } from "@reearth/util/value";
import Text from "@reearth/components/atoms/Text";
import defaultImage from "@reearth/components/atoms/Icon/Icons/primPhotoIcon.svg";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { useIcon, ho, vo } from "../common";
import useHooks, { TransitionStatus, photoDuration, photoExitDuration } from "./hooks";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    location?: LatLng;
    height?: number;
    camera?: Camera; // You may also update the field name in storytelling widget
    image?: string;
    imageSize?: number;
    imageHorizontalOrigin?: "left" | "center" | "right";
    imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
    imageClop?: "none" | "rounded" | "circle";
    imageShadow?: boolean;
    imageShadowColor?: string;
    imageShadowBlur?: number;
    imageShadowPositionX?: number;
    imageShadowPositionY?: number;
    photoOverlayImage?: string;
    photoOverlayDescription?: string;
  };
};

const PhotoOverlay: React.FC<PrimitiveProps<Property>> = ({ primitive, isSelected }) => {
  const { id, isVisible, property } = primitive ?? {};
  const {
    image,
    imageSize,
    imageHorizontalOrigin,
    imageVerticalOrigin,
    imageClop,
    imageShadow,
    imageShadowColor,
    imageShadowBlur,
    imageShadowPositionX,
    imageShadowPositionY,
    location,
    height,
    camera,
    photoOverlayImage,
    photoOverlayDescription,
  } = (property as Property | undefined)?.default ?? {};

  const [canvas] = useIcon({
    image: image || defaultImage,
    imageSize: image ? imageSize : undefined,
    crop: image ? imageClop : undefined,
    shadow: image ? imageShadow : undefined,
    shadowColor: image ? imageShadowColor : undefined,
    shadowBlur: image ? imageShadowBlur : undefined,
    shadowOffsetX: image ? imageShadowPositionX : undefined,
    shadowOffsetY: image ? imageShadowPositionY : undefined,
  });

  const theme = useTheme();

  const pos = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);

  const { photoOverlayImageTransiton, exitPhotoOverlay } = useHooks({
    camera,
    isSelected: isSelected && !!photoOverlayImage,
  });

  return !isVisible ? null : (
    <>
      <Entity id={id} position={pos}>
        <BillboardGraphics
          image={canvas}
          horizontalOrigin={ho(imageHorizontalOrigin)}
          verticalOrigin={vo(imageVerticalOrigin)}
        />
      </Entity>
      {photoOverlayImageTransiton === "unmounted" ? null : (
        <PhotoWrapper transition={photoOverlayImageTransiton} onClick={exitPhotoOverlay}>
          <Photo src={photoOverlayImage} />
          {photoOverlayDescription && (
            <Description size="xs" color={theme.main.text}>
              {nl2br(photoOverlayDescription)}
            </Description>
          )}
        </PhotoWrapper>
      )}
    </>
  );
};

const PhotoWrapper = styled.div<{ transition: TransitionStatus }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: ${({ transition }) =>
    transition === "entering" || transition === "exiting"
      ? `all ${transition === "exiting" ? photoExitDuration : photoDuration}s ease`
      : null};
  opacity: ${({ transition }) => (transition === "entering" || transition === "entered" ? 1 : 0)};
`;

const Photo = styled.img`
  max-width: 95%;
  max-height: 80%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 1);
`;

const Description = styled(Text)`
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  text-align: left;
`;

export default PhotoOverlay;
