import { getPhotoOverlayValue } from "@reearth/beta/utils/sketch";
import { ComputedFeature, MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, RefObject, useEffect, useMemo } from "react";

type PhotoOverlayProps = {
  selectedFeature?: ComputedFeature;
  mapRef?: RefObject<MapRef> | undefined;
};

const PhotoOverlay: FC<PhotoOverlayProps> = ({ selectedFeature, mapRef }) => {
  const value = useMemo(
    () => getPhotoOverlayValue(selectedFeature?.properties),
    [selectedFeature]
  );

  console.log(selectedFeature);
  console.log(value);

  useEffect(() => {
    if (mapRef && value?.camera) {
      mapRef.current?.engine?.flyTo(value.camera, { duration: 1 });
    }
  }, [mapRef, value]);

  return value ? (
    <Wrapper>
      <PhotoWrapper>
        <Photo />
      </PhotoWrapper>
      {value.description && <Description>{value.description}</Description>}
    </Wrapper>
  ) : null;
};

export default PhotoOverlay;

const Wrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: theme.zIndexes.visualizer.photoOverlay,
  background: "#ff990033",
  pointerEvents: "none"
}));

const PhotoWrapper = styled("div")(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));

const Photo = styled("img")(() => ({
  maxWidth: "100%",
  maxHeight: "100%"
}));

const Description = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  padding: theme.spacing.large,
  textAlign: "center",
  background: "#00000099",
  color: theme.content.main,
  pointerEvents: "all"
}));
