/**
 * ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/cesium/src/useSceneEvent.ts
 */
import { type Event, type JulianDate, type Scene } from "@cesium/engine";
import { useLayoutEffect, useRef } from "react";
import { useCesium } from "resium";

export type SceneEventType = {
  [K in keyof Scene]: Scene[K] extends Event ? K : never;
}[keyof Scene];

export type SceneEventListener = (scene: Scene, currentTime: JulianDate) => void;

export function useSceneEvent(type: SceneEventType, callback: SceneEventListener): void {
  const { viewer } = useCesium();
  const scene = viewer?.scene;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useLayoutEffect(() => {
    return scene?.[type].addEventListener((scene: Scene, currentTime: JulianDate) => {
      try {
        callbackRef.current(scene, currentTime);
      } catch (error) {
        // WORKAROUND: Errors in scene event listeners silently terminates
        // rendering.
        // TODO: Maybe a configuration issue.
        console.error(error);
      }
    });
  }, [type, scene]);
}

export function usePreUpdate(callback: SceneEventListener): void {
  useSceneEvent("preUpdate", callback);
}

export function usePostUpdate(callback: SceneEventListener): void {
  useSceneEvent("postUpdate", callback);
}

export function usePreRender(callback: SceneEventListener): void {
  useSceneEvent("preRender", callback);
}

export function usePostRender(callback: SceneEventListener): void {
  useSceneEvent("postRender", callback);
}
