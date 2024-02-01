import { type Scene } from "@cesium/engine";
import { type ForwardedRef } from "react";

export function requestRenderInNextFrame(scene: Scene): void {
  const removeListener = scene.preRender.addEventListener(() => {
    scene.requestRender();
    removeListener();
  });
}

export function assignForwardedRef<T>(
  forwardedRef: ForwardedRef<T> | undefined,
  value: T | null,
): (() => void) | undefined {
  if (typeof forwardedRef === "function") {
    forwardedRef(value);
    return () => {
      forwardedRef(null);
    };
  } else if (forwardedRef != null) {
    forwardedRef.current = value;
    return () => {
      forwardedRef.current = null;
    };
  }
  return;
}
