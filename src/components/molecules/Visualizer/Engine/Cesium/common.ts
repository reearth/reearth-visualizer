import { useCallback } from "react";
import {
  ColorBlendMode,
  BoundingSphere,
  HeadingPitchRange,
  HorizontalOrigin,
  VerticalOrigin,
  Camera as CesiumCamera,
  Math as CesiumMath,
  Scene,
  Cartesian2,
  Cartesian3,
  CesiumWidget,
  PerspectiveFrustum,
  Viewer,
  HeightReference,
  ShadowMode,
} from "cesium";

import { useCanvas, useImage } from "@reearth/util/image";
import { Camera } from "@reearth/util/value";
import { tweenInterval } from "@reearth/util/raf";

const defaultImageSize = 50;

export const drawIcon = (
  c: HTMLCanvasElement,
  image: HTMLImageElement | undefined,
  imageSize: number | undefined,
  crop: "circle" | "rounded" | "none" = "none",
  shadow = false,
  shadowColor = "rgba(0, 0, 0, 0.7)",
  shadowBlur = 3,
  shadowOffsetX = 0,
  shadowOffsetY = 0,
) => {
  const ctx = c.getContext("2d");
  if (!image || !ctx) return;

  ctx.save();

  const w =
    typeof imageSize === "number"
      ? Math.floor(image.width * imageSize)
      : Math.min(defaultImageSize, image.width);
  const h =
    typeof imageSize === "number"
      ? Math.floor(image.height * imageSize)
      : Math.floor((w / image.width) * image.height);
  c.width = w + shadowBlur;
  c.height = h + shadowBlur;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = shadowOffsetX;
  ctx.shadowOffsetY = shadowOffsetY;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(image, (c.width - w) / 2, (c.height - h) / 2, w, h);

  if (crop === "circle") {
    ctx.fillStyle = "black";
    ctx.globalCompositeOperation = "destination-in";
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
    ctx.fill();

    if (shadow) {
      ctx.shadowColor = shadowColor;
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "black";
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (shadow) {
    ctx.shadowColor = shadowColor;
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "black";
    ctx.rect((c.width - w) / 2, (c.height - h) / 2, w, h);
    ctx.fill();
  }

  ctx.restore();
};

export const useIcon = ({
  image,
  imageSize,
  crop,
  shadow,
  shadowColor,
  shadowBlur,
  shadowOffsetX,
  shadowOffsetY,
}: {
  image?: string;
  imageSize?: number;
  crop?: "circle" | "rounded" | "none";
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}): [HTMLCanvasElement, HTMLImageElement | undefined] => {
  const img = useImage(image);
  const draw = useCallback(
    can =>
      drawIcon(
        can,
        img,
        imageSize,
        crop,
        shadow,
        shadowColor,
        shadowBlur,
        shadowOffsetX,
        shadowOffsetY,
      ),
    [crop, imageSize, img, shadow, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY],
  );
  const canvas = useCanvas(draw);
  return [canvas, img];
};

export const ho = (o: "left" | "center" | "right" | undefined): HorizontalOrigin | undefined =>
  ({
    left: HorizontalOrigin.LEFT,
    center: HorizontalOrigin.CENTER,
    right: HorizontalOrigin.RIGHT,
    [""]: undefined,
  }[o || ""]);

export const vo = (
  o: "top" | "center" | "baseline" | "bottom" | undefined,
): VerticalOrigin | undefined =>
  ({
    top: VerticalOrigin.TOP,
    center: VerticalOrigin.CENTER,
    baseline: VerticalOrigin.BASELINE,
    bottom: VerticalOrigin.BOTTOM,
    [""]: undefined,
  }[o || ""]);

export const getLocationFromScreenXY = (scene: Scene | undefined | null, x: number, y: number) => {
  if (!scene) return undefined;
  const camera = scene.camera;
  const ellipsoid = scene.globe.ellipsoid;
  const cartesian = camera?.pickEllipsoid(new Cartesian2(x, y), ellipsoid);
  if (!cartesian) return undefined;
  const { latitude, longitude, height } = ellipsoid.cartesianToCartographic(cartesian);
  return {
    lat: CesiumMath.toDegrees(latitude),
    lng: CesiumMath.toDegrees(longitude),
    height,
  };
};

export const flyTo = (
  cesiumCamera?: CesiumCamera,
  camera?: {
    /** degrees */
    lat?: number;
    /** degrees */
    lng?: number;
    /** meters */
    height?: number;
    /** radians */
    heading?: number;
    /** radians */
    pitch?: number;
    /** radians */
    roll?: number;
    /** Field of view expressed in radians */
    fov?: number;
  },
  options?: {
    /** Seconds */
    duration?: number;
    easing?: (time: number) => number;
  },
) => {
  if (!cesiumCamera || !camera) return () => {};

  const cancelFov = animateFOV({
    fov: camera.fov,
    camera: cesiumCamera,
    duration: options?.duration,
    easing: options?.easing,
  });

  const position =
    typeof camera.lat === "number" &&
    typeof camera.lng === "number" &&
    typeof camera.height === "number"
      ? Cartesian3.fromDegrees(camera.lng, camera.lat, camera.height)
      : undefined;

  if (position) {
    cesiumCamera.flyTo({
      destination: position,
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
      duration: options?.duration ?? 0,
      easingFunction: options?.easing,
    });
  }

  return () => {
    cancelFov?.();
    cesiumCamera?.cancelFlight();
  };
};

export const lookAt = (
  cesiumCamera?: CesiumCamera,
  camera?: {
    /** degrees */
    lat?: number;
    /** degrees */
    lng?: number;
    /** meters */
    height?: number;
    /** radians */
    heading?: number;
    /** radians */
    pitch?: number;
    /** radians */
    range?: number;
    /** Field of view expressed in radians */
    fov?: number;
  },
  options?: {
    /** Seconds */
    duration?: number;
    easing?: (time: number) => number;
  },
) => {
  if (!cesiumCamera || !camera) return () => {};

  const cancelFov = animateFOV({
    fov: camera.fov,
    camera: cesiumCamera,
    duration: options?.duration,
    easing: options?.easing,
  });

  const position =
    typeof camera.lat === "number" &&
    typeof camera.lng === "number" &&
    typeof camera.height === "number"
      ? Cartesian3.fromDegrees(camera.lng, camera.lat, camera.height)
      : undefined;

  if (position) {
    cesiumCamera.flyToBoundingSphere(new BoundingSphere(position), {
      offset: new HeadingPitchRange(camera.heading, camera.pitch, camera.range),
      duration: options?.duration,
      easingFunction: options?.easing,
    });
  }

  return () => {
    cancelFov?.();
    cesiumCamera?.cancelFlight();
  };
};

export const animateFOV = ({
  fov,
  camera,
  easing,
  duration,
}: {
  fov?: number;
  camera: CesiumCamera;
  easing?: (t: number) => number;
  duration?: number;
}): (() => void) | undefined => {
  // fov animation
  if (
    typeof fov === "number" &&
    camera.frustum instanceof PerspectiveFrustum &&
    typeof camera.frustum.fov === "number" &&
    camera.frustum.fov !== fov
  ) {
    const fromFov = camera.frustum.fov;
    return tweenInterval(
      t => {
        if (!(camera.frustum instanceof PerspectiveFrustum)) return;
        camera.frustum.fov = (fov - fromFov) * t + fromFov;
      },
      easing || "inOutCubic",
      (duration ?? 0) * 1000,
    );
  }
  return undefined;
};

export const getCamera = (viewer: Viewer | CesiumWidget | undefined): Camera | undefined => {
  if (!viewer || viewer.isDestroyed() || !viewer.camera || !viewer.scene) return undefined;
  const { camera } = viewer;
  if (!(camera.frustum instanceof PerspectiveFrustum)) return;

  const ellipsoid = viewer.scene.globe.ellipsoid;
  const { latitude, longitude, height } = ellipsoid.cartesianToCartographic(camera.position);
  const lat = CesiumMath.toDegrees(latitude);
  const lng = CesiumMath.toDegrees(longitude);
  const { heading, pitch, roll } = camera;
  const { fov } = camera.frustum;

  return { lng, lat, height, heading, pitch, roll, fov };
};

export const colorBlendMode = (colorBlendMode?: "highlight" | "replace" | "mix" | "none") =>
  ((
    {
      highlight: ColorBlendMode.HIGHLIGHT,
      replace: ColorBlendMode.REPLACE,
      mix: ColorBlendMode.MIX,
    } as { [key in string]?: ColorBlendMode }
  )[colorBlendMode || ""]);

export const heightReference = (
  heightReference?: "none" | "clamp" | "relative",
): HeightReference | undefined =>
  ((
    { clamp: HeightReference.CLAMP_TO_GROUND, relative: HeightReference.RELATIVE_TO_GROUND } as {
      [key in string]?: HeightReference;
    }
  )[heightReference || ""]);

export const shadowMode = (
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only",
): ShadowMode | undefined =>
  ((
    {
      enabled: ShadowMode.ENABLED,
      cast_only: ShadowMode.CAST_ONLY,
      receive_only: ShadowMode.RECEIVE_ONLY,
    } as {
      [key in string]?: ShadowMode;
    }
  )[shadows || ""]);
