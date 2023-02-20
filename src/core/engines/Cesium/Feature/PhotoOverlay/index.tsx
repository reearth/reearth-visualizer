import { Cartesian3 } from "cesium";
import { useMemo } from "react";
import nl2br from "react-nl2br";
import { BillboardGraphics } from "resium";

import defaultImage from "@reearth/components/atoms/Icon/Icons/primPhotoIcon.svg";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import type { LegacyPhotooverlayAppearance } from "../../..";
import { heightReference, ho, useIcon, vo } from "../../common";
import {
  EntityExt,
  toDistanceDisplayCondition,
  toTimeInterval,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

import useHooks, { photoDuration, photoExitDuration, TransitionStatus } from "./hooks";

export type Props = FeatureProps<Property>;

export type Property = LegacyPhotooverlayAppearance;

export default function PhotoOverlay({
  id,
  isVisible,
  property,
  geometry,
  isSelected,
  layer,
  feature,
}: Props) {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property?.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.height, property?.location],
  );

  const {
    image,
    imageSize,
    imageHorizontalOrigin,
    imageVerticalOrigin,
    imageCrop,
    imageShadow,
    imageShadowColor,
    imageShadowBlur,
    imageShadowPositionX,
    imageShadowPositionY,
    heightReference: hr,
    camera,
    photoOverlayImage,
    photoOverlayDescription,
  } = property ?? {};

  const [canvas] = useIcon({
    image: image || defaultImage,
    imageSize: image ? imageSize : undefined,
    crop: image ? imageCrop : undefined,
    shadow: image ? imageShadow : undefined,
    shadowColor: image ? imageShadowColor : undefined,
    shadowBlur: image ? imageShadowBlur : undefined,
    shadowOffsetX: image ? imageShadowPositionX : undefined,
    shadowOffsetY: image ? imageShadowPositionY : undefined,
  });

  const theme = useTheme();

  const pos = useMemo(
    () =>
      coordinates
        ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
        : undefined,
    [coordinates],
  );

  const { photoOverlayImageTransiton, exitPhotoOverlay } = useHooks({
    camera,
    isSelected: isSelected && !!photoOverlayImage,
  });

  const availability = useMemo(() => toTimeInterval(feature?.interval), [feature?.interval]);
  const distanceDisplayCondition = useMemo(
    () => toDistanceDisplayCondition(property?.near, property?.far),
    [property?.near, property?.far],
  );

  return !isVisible || !pos ? null : (
    <>
      <EntityExt
        id={id}
        position={pos}
        layerId={layer?.id}
        featureId={feature?.id}
        draggable
        availability={availability}>
        <BillboardGraphics
          image={canvas}
          horizontalOrigin={ho(imageHorizontalOrigin)}
          verticalOrigin={vo(imageVerticalOrigin)}
          heightReference={heightReference(hr)}
          distanceDisplayCondition={distanceDisplayCondition}
        />
      </EntityExt>
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
}

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

export const config: FeatureComponentConfig = {
  noLayer: true,
};
