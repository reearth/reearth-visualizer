import {
  getPhotoOverlayValue,
  PhotoOverlayPreview
} from "@reearth/beta/utils/sketch";
import { Camera, ComputedFeature, ComputedLayer, MapRef } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { styled } from "@reearth/services/theme";
import {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import useCamera, { DEFAULT_CAMERA_DURATION } from "./useCamera";
import useSize from "./useSize";

type PhotoOverlayProps = {
  preview?: PhotoOverlayPreview;
  selectedLayer?: ComputedLayer;
  selectedFeature?: ComputedFeature;
  mapRef?: RefObject<MapRef> | undefined;
  nlsLayers?: NLSLayer[];
  currentCameraRef?: RefObject<Camera | undefined>;
};

const PhotoOverlay: FC<PhotoOverlayProps> = ({
  preview,
  selectedLayer,
  selectedFeature,
  mapRef,
  currentCameraRef
}) => {
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);

  const cameraDurationRef = useRef<number>(DEFAULT_CAMERA_DURATION);

  const value = useMemo(() => {
    if (preview) return preview.value;

    const featureId = selectedFeature?.id;
    if (selectedLayer?.layer.type !== "simple") return;

    // TODO: Connect layer's photoOverlay settings
    // const nlsLayer = nlsLayers?.find((l) => l.id === selectedLayer?.layer.id);
    // if (!nlsLayer?.photoOverlay?.enabled) return;

    const dataFeatureProperties =
      selectedLayer?.layer?.data?.value?.features?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (f: any) => f.properties?.id === featureId
      )?.properties;

    if (!dataFeatureProperties) return;

    // TODO: Connect layer's photoOverlay settings
    cameraDurationRef.current = DEFAULT_CAMERA_DURATION;

    return getPhotoOverlayValue(dataFeatureProperties);
  }, [preview, selectedLayer, selectedFeature]);

  const handleShow = useCallback(() => {
    setShow(true);
  }, []);

  useCamera({
    value,
    mapRef,
    currentCameraRef,
    cameraDurationRef,
    isPreview: !!preview,
    onFlyEnd: handleShow
  });

  const { sizeBase, photoWrapperRef, heightPct, setPhotoSize } = useSize({
    value
  });

  const handlePhotoLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const image = e.target as HTMLImageElement;
      setPhotoSize({ width: image.width, height: image.height });
      setReady(true);
    },
    [setPhotoSize, setReady]
  );

  useEffect(() => {
    setShow(false);
    setReady(false);
  }, [value?.url]);

  const handleExit = useCallback(() => {
    mapRef?.current?.layers.select(undefined);
  }, [mapRef]);

  return value ? (
    <Wrapper interactive={!preview}>
      <PhotoWrapper
        ref={photoWrapperRef}
        visible={show && ready}
        onClick={handleExit}
      >
        <PhotoInnerWrapper
          widthPct={value.widthPct}
          heightPct={heightPct}
          sizeBase={sizeBase}
          fixed={value.fill === "fixed"}
        >
          <Photo
            src={value.url}
            opacity={preview?.transparency}
            fixed={value.fill === "fixed"}
            sizeBase={sizeBase}
            onLoad={handlePhotoLoad}
            draggable={false}
          />
        </PhotoInnerWrapper>
      </PhotoWrapper>
      {value.description && (
        <Description visible={show && ready}>{value.description}</Description>
      )}
    </Wrapper>
  ) : null;
};

export default PhotoOverlay;

const Wrapper = styled("div")<{ interactive: boolean }>(
  ({ theme, interactive }) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    zIndex: theme.zIndexes.visualizer.photoOverlay,
    pointerEvents: interactive ? "all" : "none"
  })
);

const PhotoWrapper = styled("div")<{ visible: boolean }>(({ visible }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  opacity: visible ? 1 : 0,
  transition: "opacity 0.25s"
}));

const PhotoInnerWrapper = styled("div")<{
  widthPct?: number;
  heightPct?: number;
  sizeBase: "width" | "height";
  fixed: boolean;
}>(({ widthPct, heightPct, sizeBase, fixed }) => ({
  position: "absolute",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ...(fixed
    ? sizeBase === "width"
      ? { height: "100%", width: `${widthPct}%` }
      : { width: "100%", height: `${heightPct}%` }
    : { width: "100%", height: "100%" })
}));

const Photo = styled("img")<{
  opacity?: number;
  fixed: boolean;
  sizeBase: "width" | "height";
}>(({ opacity, fixed, sizeBase }) => ({
  opacity: opacity ?? 1,
  ...(fixed
    ? sizeBase === "width"
      ? { width: "100%", height: "auto", maxHeight: "none" }
      : { height: "100%", width: "auto", maxWidth: "none" }
    : { maxWidth: "90%", maxHeight: "90%" })
}));

const Description = styled("div")<{ visible: boolean }>(
  ({ theme, visible }) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    padding: theme.spacing.large,
    textAlign: "center",
    background: "#00000099",
    color: theme.content.main,
    pointerEvents: "all",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.25s"
  })
);
