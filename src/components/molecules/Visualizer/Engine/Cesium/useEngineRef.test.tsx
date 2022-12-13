import { renderHook } from "@testing-library/react";
import {
  ClockStep,
  JulianDate,
  Viewer as CesiumViewer,
  Cartesian3,
  Globe,
  Ellipsoid,
  Matrix4,
  SceneMode,
} from "cesium";
import { useRef } from "react";
import type { CesiumComponentRef } from "resium";
import { vi, expect, test, afterEach } from "vitest";

import { Clock } from "../../Plugin/types";
import { EngineRef } from "../ref";

import useEngineRef from "./useEngineRef";

vi.mock("./common", async () => {
  const commons: Record<string, any> = await vi.importActual("./common");
  return {
    ...commons,
    zoom: vi.fn(),
    getCenterCamera: vi.fn(({ scene }) => scene?.globe?.pick?.()),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

test("engine should be cesium", () => {
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });
  expect(result.current.current?.name).toBe("cesium");
});

test("bind mouse events", () => {
  const mockMouseEventCallback = vi.fn(e => e);
  const props = { x: 1, y: 1 };
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.onClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.click).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.click?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(1);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onDoubleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.doubleclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.doubleclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(2);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousedown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousedown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(3);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(4);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(5);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightdown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightdown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(6);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(7);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(8);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middledown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middledown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(9);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(10);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseMove(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousemove).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousemove?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(11);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseEnter(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseenter).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseenter?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(12);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseLeave(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseleave).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseleave?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(13);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onWheel(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.wheel).toBe(mockMouseEventCallback);

  const wheelProps = { delta: 1 };
  result.current.current?.mouseEventCallbacks.wheel?.(wheelProps);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(14);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(wheelProps);
});

const mockRequestRender = vi.fn();
test("requestRender", () => {
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        scene: {
          requestRender: mockRequestRender,
        },
        isDestroyed: () => {
          return false;
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });
  result.current.current?.requestRender();
  expect(mockRequestRender).toHaveBeenCalledTimes(1);
});

test("zoom", async () => {
  const viewer = {
    scene: {
      camera: {},
    },
    isDestroyed: () => {
      return false;
    },
  } as any;
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: viewer,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  const commons = await import("./common");

  result.current.current?.zoomIn(10);
  expect(commons.zoom).toHaveBeenCalledTimes(1);
  expect(commons.zoom).toHaveBeenCalledWith(
    {
      viewer,
      relativeAmount: 0.1,
    },
    undefined,
  );

  result.current.current?.zoomOut(20);
  expect(commons.zoom).toHaveBeenCalledTimes(2);
  expect(commons.zoom).toHaveBeenCalledWith(
    {
      viewer,
      relativeAmount: 20,
    },
    undefined,
  );
});

test("call orbit when camera focuses on center", async () => {
  const { result } = renderHook(() => {
    const cesiumElement = {
      scene: {
        camera: {
          lookAtTransform: vi.fn(),
          rotateLeft: vi.fn(),
          rotateUp: vi.fn(),
          look: vi.fn(),
          move: vi.fn(),
          positionCartographic: new Cartesian3(),
        },
        mode: SceneMode.SCENE3D,
        globe: {
          ellipsoid: new Ellipsoid(),
          pick: () => new Cartesian3(),
        },
        canvas: {
          clientWidth: 100,
          clientHeight: 100,
        },
      },
      transform: new Matrix4(),
      positionWC: new Cartesian3(),
      isDestroyed: () => {
        return false;
      },
    } as any;
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return [engineRef, cesium] as const;
  });

  const commons = await import("./common");

  const [engineRef, cesium] = result.current;

  engineRef.current?.orbit(90);
  expect(commons.getCenterCamera).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.rotateLeft).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.rotateUp).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.lookAtTransform).toHaveBeenCalledTimes(2);
});

test("call orbit when camera does not focus on center", async () => {
  const { result } = renderHook(() => {
    const cesiumElement = {
      scene: {
        camera: {
          lookAtTransform: vi.fn(),
          rotateLeft: vi.fn(),
          rotateUp: vi.fn(),
          look: vi.fn(),
          move: vi.fn(),
          positionWC: new Cartesian3(),
          positionCartographic: new Cartesian3(),
        },
        mode: SceneMode.SCENE3D,
        globe: {
          ellipsoid: new Ellipsoid(),
          pick: () => undefined,
        },
        canvas: {
          clientWidth: 100,
          clientHeight: 100,
        },
      },
      transform: new Matrix4(),
      isDestroyed: () => {
        return false;
      },
    } as any;
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return [engineRef, cesium] as const;
  });

  const commons = await import("./common");

  const [engineRef, cesium] = result.current;

  engineRef.current?.orbit(90);
  expect(commons.getCenterCamera).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.look).toHaveBeenCalledTimes(2);
  expect(cesium.current.cesiumElement?.scene.camera.lookAtTransform).toHaveBeenCalledTimes(2);
});

test("orbit on 2D mode", async () => {
  const { result } = renderHook(() => {
    const cesiumElement = {
      scene: {
        camera: {
          lookAtTransform: vi.fn(),
          rotateLeft: vi.fn(),
          rotateUp: vi.fn(),
          look: vi.fn(),
          move: vi.fn(),
          positionWC: new Cartesian3(),
          positionCartographic: new Cartesian3(),
        },
        mode: SceneMode.SCENE2D,
        globe: {
          ellipsoid: new Ellipsoid(),
          pick: () => undefined,
        },
        canvas: {
          clientWidth: 100,
          clientHeight: 100,
        },
      },
      transform: new Matrix4(),
      isDestroyed: () => {
        return false;
      },
    } as any;
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return [engineRef, cesium] as const;
  });

  const [engineRef, cesium] = result.current;

  engineRef.current?.orbit(90);
  expect(cesium.current.cesiumElement?.scene.camera.move).toHaveBeenCalledTimes(1);
});

test("rotateRight", async () => {
  const { result } = renderHook(() => {
    const cesiumElement = {
      scene: {
        camera: {
          lookAtTransform: vi.fn(),
          rotateRight: vi.fn(),
          positionWC: new Cartesian3(),
          twistRight: vi.fn(),
          twistLeft: vi.fn(),
        },
        mode: SceneMode.SCENE3D,
        globe: {
          ellipsoid: new Ellipsoid(),
        },
      },
      transform: new Matrix4(),
      isDestroyed: () => {
        return false;
      },
    } as any;
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return [engineRef, cesium] as const;
  });

  const [engineRef, cesium] = result.current;

  engineRef.current?.rotateRight(90);
  expect(cesium.current.cesiumElement?.scene.camera.rotateRight).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.lookAtTransform).toHaveBeenCalledTimes(2);
});

test("rotateRight on 2D mode", async () => {
  const { result } = renderHook(() => {
    const cesiumElement = {
      scene: {
        camera: {
          lookAtTransform: vi.fn(),
          rotateRight: vi.fn(),
          positionWC: new Cartesian3(),
          twistRight: vi.fn(),
          twistLeft: vi.fn(),
        },
        mode: SceneMode.SCENE2D,
        globe: {
          ellipsoid: new Ellipsoid(),
        },
      },
      transform: new Matrix4(),
      isDestroyed: () => {
        return false;
      },
    } as any;
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return [engineRef, cesium] as const;
  });

  const [engineRef, cesium] = result.current;

  engineRef.current?.rotateRight(90);
  expect(cesium.current.cesiumElement?.scene.camera.twistLeft).toHaveBeenCalled();
  expect(cesium.current.cesiumElement?.scene.camera.twistRight).toHaveBeenCalled();
});

test("getClock", () => {
  const tickTime = JulianDate.fromIso8601("2022-01-13");
  const mockAddEventHandler: any = vi.fn(_cb => {});
  const mockRemoveEventHandler: any = vi.fn(_cb => {});
  const mockTick = vi.fn(() => tickTime);

  const startTime = JulianDate.fromIso8601("2022-01-11");
  const stopTime = JulianDate.fromIso8601("2022-01-15");
  const currentTime = JulianDate.fromIso8601("2022-01-14");
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        clock: {
          startTime,
          stopTime,
          tick: mockTick,
          currentTime,
          shouldAnimate: false,
          multiplier: 1,
          clockStep: ClockStep.SYSTEM_CLOCK,
          // TODO: should test cesium event
          onTick: {
            addEventListener: mockAddEventHandler,
            removeEventListener: mockRemoveEventHandler,
          },
        },
        isDestroyed: () => {
          return false;
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return { engineRef, cesium };
  });

  expect(result.current.engineRef.current?.getClock()?.startTime).toEqual(
    JulianDate.toDate(startTime),
  );
  expect(result.current.engineRef.current?.getClock()?.stopTime).toEqual(
    JulianDate.toDate(stopTime),
  );
  expect(result.current.engineRef.current?.getClock()?.currentTime).toEqual(
    JulianDate.toDate(currentTime),
  );
  expect(result.current.engineRef.current?.getClock()?.playing).toBeFalsy();
  expect(result.current.cesium.current.cesiumElement?.clock?.shouldAnimate).toBeFalsy();
  expect(result.current.engineRef.current?.getClock()?.speed).toBe(1);
  expect(result.current.cesium.current.cesiumElement?.clock?.multiplier).toBe(1);
  expect(result.current.cesium.current.cesiumElement?.clock?.clockStep).toBe(
    ClockStep.SYSTEM_CLOCK,
  );

  const nextTickTime = result.current.engineRef.current?.getClock()?.tick();

  expect(nextTickTime).toEqual(JulianDate.toDate(tickTime));

  const nextStartTime = JulianDate.fromIso8601("2022-01-10");
  const nextStopTime = JulianDate.fromIso8601("2022-01-16");
  const nextCurrentTime = JulianDate.fromIso8601("2022-01-11");
  const clock = result.current.engineRef.current?.getClock() || ({} as Clock);
  clock.startTime = JulianDate.toDate(nextStartTime);
  clock.stopTime = JulianDate.toDate(nextStopTime);
  clock.currentTime = JulianDate.toDate(nextCurrentTime);
  clock.playing = true;
  clock.speed = 2;
  expect(result.current.engineRef.current?.getClock()?.startTime).toEqual(
    JulianDate.toDate(nextStartTime),
  );
  expect(result.current.engineRef.current?.getClock()?.stopTime).toEqual(
    JulianDate.toDate(nextStopTime),
  );
  expect(result.current.engineRef.current?.getClock()?.currentTime).toEqual(
    JulianDate.toDate(nextCurrentTime),
  );
  expect(result.current.engineRef.current?.getClock()?.playing).toBeTruthy();
  expect(result.current.cesium.current.cesiumElement?.clock?.shouldAnimate).toBeTruthy();
  expect(result.current.engineRef.current?.getClock()?.speed).toBe(2);
  expect(result.current.cesium.current.cesiumElement?.clock?.multiplier).toBe(2);
  expect(result.current.cesium.current.cesiumElement?.clock?.clockStep).toBe(
    ClockStep.SYSTEM_CLOCK_MULTIPLIER,
  );
});

test("captureScreen", () => {
  const mockViewerRender = vi.fn();
  const mockCanvasToDataURL = vi.fn();
  const mockViewerIsDestroyed = vi.fn(() => false);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        render: mockViewerRender,
        isDestroyed: mockViewerIsDestroyed,
        canvas: {
          toDataURL: mockCanvasToDataURL,
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.captureScreen();
  expect(mockViewerRender).toHaveBeenCalledTimes(1);
  expect(mockCanvasToDataURL).toHaveBeenCalledTimes(1);

  result.current.current?.captureScreen("image/jpeg", 0.8);
  expect(mockCanvasToDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
});

test("move", () => {
  const mockMove = vi.fn(e => e);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        isDestroyed: () => false,
        scene: {
          camera: {
            position: new Cartesian3(0, 0, 1),
            direction: Cartesian3.clone(Cartesian3.UNIT_X),
            up: Cartesian3.clone(Cartesian3.UNIT_Z),
            right: Cartesian3.clone(Cartesian3.UNIT_Y),
            move: mockMove,
          },
          globe: new Globe(Ellipsoid.UNIT_SPHERE),
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.moveForward(100);
  expect(mockMove).toHaveBeenCalledTimes(1);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(1, 0, 0), 100);

  result.current.current?.moveBackward(100);
  expect(mockMove).toHaveBeenCalledTimes(2);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(1, 0, 0), -100);

  result.current.current?.moveUp(100);
  expect(mockMove).toHaveBeenCalledTimes(3);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(0, 0, 1), 100);

  result.current.current?.moveDown(100);
  expect(mockMove).toHaveBeenCalledTimes(4);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(0, 0, 1), -100);

  result.current.current?.moveRight(100);
  expect(mockMove).toHaveBeenCalledTimes(5);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(0, 1, 0), 100);

  result.current.current?.moveLeft(100);
  expect(mockMove).toHaveBeenCalledTimes(6);
  expect(mockMove).toHaveBeenLastCalledWith(new Cartesian3(0, 1, 0), -100);
});

test("look", () => {
  const mockLook = vi.fn(e => e);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        isDestroyed: () => false,
        scene: {
          camera: {
            position: new Cartesian3(0, 0, 1),
            direction: Cartesian3.clone(Cartesian3.UNIT_X),
            up: Cartesian3.clone(Cartesian3.UNIT_Z),
            right: Cartesian3.clone(Cartesian3.UNIT_Y),
            look: mockLook,
          },
          globe: new Globe(Ellipsoid.UNIT_SPHERE),
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.lookHorizontal(90);
  expect(mockLook).toHaveBeenCalledTimes(1);
  expect(mockLook).toHaveBeenLastCalledWith(new Cartesian3(0, 0, 1), 90);

  result.current.current?.lookVertical(90);
  expect(mockLook).toHaveBeenCalledTimes(2);
  expect(mockLook).toHaveBeenLastCalledWith(new Cartesian3(0, 1, 0), 90);
});

test("get location from screen xy", () => {
  const mockGetPickRay = vi.fn(() => true);
  const mockPickEllipsoid = vi.fn(() =>
    Cartesian3.fromDegrees(137, 40, 0, new Globe(Ellipsoid.WGS84).ellipsoid),
  );
  const mockPick = vi.fn(() =>
    Cartesian3.fromDegrees(110, 20, 10000, new Globe(Ellipsoid.WGS84).ellipsoid),
  );
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        isDestroyed: () => false,
        scene: {
          camera: {
            getPickRay: mockGetPickRay,
            pickEllipsoid: mockPickEllipsoid,
          },
          globe: {
            ellipsoid: new Globe(Ellipsoid.WGS84).ellipsoid,
            pick: mockPick,
          },
        },
      } as any,
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  const location = result.current.current?.getLocationFromScreen(0, 0);
  expect(location?.lng).toBeCloseTo(137, 0);
  expect(location?.lat).toBeCloseTo(40, 0);
  expect(location?.height).toBeCloseTo(0, 0);
  const location2 = result.current.current?.getLocationFromScreen(0, 0, true);
  expect(location2?.lng).toBeCloseTo(110, 0);
  expect(location2?.lat).toBeCloseTo(20, 0);
  expect(location2?.height).toBeCloseTo(10000, 0);
});
