import { Icon } from "@reearth/beta/lib/reearth-ui";
import { Button } from "@reearth/beta/lib/reearth-widget-ui/components/ui/button";
import {
  getPhotoOverlayValue,
  PhotoOverlayPreview
} from "@reearth/beta/utils/sketch";
import { Camera, ComputedFeature, ComputedLayer, MapRef } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
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
  mapRef?: RefObject<MapRef> | undefined;
  nlsLayers?: NLSLayer[];
  currentCameraRef?: RefObject<Camera | undefined>;
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
        className={`tw-absolute tw-w-full tw-h-full tw-left-0 tw-top-0 tw-flex tw-justify-center tw-items-center tw-transition-opacity tw-duration-200 ${show && ready ? "tw-opacity-100" : "tw-opacity-0"}`}
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
        <div className={`tw-absolute tw-right-1 tw-top-1`}>
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
    className={`tw-absolute tw-w-full tw-h-full tw-left-0 tw-top-0 tw-z-photoOverlay ${interactive ? "tw-pointer-events-auto" : "tw-pointer-events-none"}`}
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
      className={`tw-absolute tw-flex tw-justify-center tw-items-center`}
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
          ? "tw-w-full tw-h-auto tw-max-h-none"
          : "tw-h-full tw-w-auto tw-max-w-none"
        : "tw-max-w-[90%] tw-max-h-[90%]"
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
    className={`tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-p-2 tw-text-center tw-bg-[#00000099] tw-text-sm tw-text-white tw-pointer-events-auto tw-transition-opacity tw-duration-200 ${visible ? "tw-opacity-100" : "tw-opacity-0"} tw-whitespace-pre-wrap`}
  >
    {children}
  </div>
);
