import { Icon } from "@reearth/app/lib/reearth-ui";
import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import {
  getPhotoOverlayValue,
  PhotoOverlayPreview
} from "@reearth/app/utils/sketch";
import { Camera, ComputedFeature, ComputedLayer, MapRef } from "@reearth/core";
import type { NLSLayer } from "@reearth/services/api/layer";
import {
  FC,
  ReactNode,
  RefObject,
  SyntheticEvent,
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
  mapRef?: RefObject<MapRef | null> | undefined;
  nlsLayers?: NLSLayer[];
  currentCameraRef?: RefObject<Camera | undefined | null>;
};

const PhotoOverlay: FC<PhotoOverlayProps> = ({
  preview,
  selectedLayer,
  selectedFeature,
  mapRef,
  nlsLayers,
  currentCameraRef
}) => {
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);

  const cameraDurationRef = useRef<number>(DEFAULT_CAMERA_DURATION);

  const value = useMemo(() => {
    if (preview) return preview.value;

    const featureId = selectedFeature?.id;
    if (selectedLayer?.layer.type !== "simple") return;

    const nlsLayer = nlsLayers?.find((l) => l.id === selectedLayer?.layer.id);
    if (!nlsLayer?.photoOverlay?.processedProperty?.enabled) return;

    const dataFeatureProperties =
      selectedLayer?.layer?.data?.value?.features?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (f: any) => f.properties?.id === featureId
      )?.properties;

    if (!dataFeatureProperties) return;

    cameraDurationRef.current =
      nlsLayer?.photoOverlay?.processedProperty?.cameraDuration ??
      DEFAULT_CAMERA_DURATION;

    return getPhotoOverlayValue(dataFeatureProperties);
  }, [preview, selectedLayer, selectedFeature, nlsLayers]);

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
      <div
        ref={photoWrapperRef}
        onClick={handleExit}
        className={`absolute w-full h-full left-0 top-0 flex justify-center items-center transition-opacity duration-200 ${show && ready ? "opacity-100" : "opacity-0"}`}
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
          />
        </PhotoInnerWrapper>
      </div>
      {value.description && (
        <Description visible={show && ready}>{value.description}</Description>
      )}
      {!preview && (
        <div className={`absolute right-1 top-1`}>
          <Button size="icon" onClick={handleExit}>
            <Icon icon="close" />
          </Button>
        </div>
      )}
    </Wrapper>
  ) : null;
};

export default PhotoOverlay;

const Wrapper: FC<{
  interactive: boolean;
  children: ReactNode;
}> = ({ interactive, children }) => (
  <div
    className={`absolute w-full h-full left-0 top-0 z-(--z-photo-overlay) ${interactive ? "pointer-events-auto" : "pointer-events-none"}`}
  >
    {children}
  </div>
);

const PhotoInnerWrapper: FC<{
  widthPct?: number;
  heightPct?: number;
  sizeBase: "width" | "height";
  fixed: boolean;
  children: ReactNode;
}> = ({ widthPct, heightPct, sizeBase, fixed, children }) => {
  const sizeStyles: { width: string; height: string } = useMemo(() => {
    return fixed
      ? sizeBase === "width"
        ? { height: "100%", width: `${widthPct}%` }
        : { width: "100%", height: `${heightPct}%` }
      : { width: "100%", height: "100%" };
  }, [fixed, sizeBase, widthPct, heightPct]);

  return (
    <div
      className={`absolute flex justify-center items-center`}
      style={sizeStyles}
    >
      {children}
    </div>
  );
};

const Photo: FC<{
  src?: string;
  opacity?: number;
  fixed: boolean;
  sizeBase: "width" | "height";
  onLoad: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
}> = ({ src, opacity, fixed, sizeBase, onLoad }) => (
  <img
    src={src}
    style={{ opacity: opacity ?? 1 }}
    className={`${
      fixed
        ? sizeBase === "width"
          ? "w-full h-auto max-h-none"
          : "h-full w-auto max-w-none"
        : "max-w-[90%] max-h-[90%]"
    }`}
    onLoad={onLoad}
    draggable={false}
  />
);

const Description: FC<{
  visible: boolean;
  children: ReactNode;
}> = ({ visible, children }) => (
  <div
    className={`absolute bottom-0 left-0 w-full p-2 text-center bg-[#00000099] text-sm text-white pointer-events-auto transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"} whitespace-pre-wrap`}
  >
    {children}
  </div>
);
