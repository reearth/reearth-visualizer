import { renderHook } from "@testing-library/react";
import {
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

import type { EngineRef, Clock } from "..";

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
  expect(result.current.current?.mouseEventCallbacks.click[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.click[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(1);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onDoubleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.doubleclick[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.doubleclick[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(2);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousedown[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousedown[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(3);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseup[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseup[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(4);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightclick[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightclick[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(5);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightdown[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightdown[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(6);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightup[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightup[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(7);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleclick[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleclick[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(8);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middledown[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middledown[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(9);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleup[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleup[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(10);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseMove(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousemove[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousemove[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(11);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseEnter(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseenter[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseenter[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(12);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseLeave(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseleave[0]).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseleave[0]?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(13);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onWheel(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.wheel[0]).toBe(mockMouseEventCallback);

  const wheelProps = { delta: 1 };
  result.current.current?.mouseEventCallbacks.wheel[0]?.(wheelProps);
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
  const startTime = JulianDate.fromIso8601("2022-01-11");
  const stopTime = JulianDate.fromIso8601("2022-01-15");
  const currentTime = JulianDate.fromIso8601("2022-01-14");
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        clock: {
          startTime,
          stopTime,
          currentTime,
          shouldAnimate: false,
          multiplier: 1,
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

  const actual = result.current.engineRef.current?.getClock();
  expect(actual).toEqual<Clock>({
    start: JulianDate.toDate(startTime),
    stop: JulianDate.toDate(stopTime),
    current: JulianDate.toDate(currentTime),
    playing: false,
    speed: 1,
  });
});

test("captureScreen", () => {
  const mockViewerRender = vi.fn();
  const mockCanvasToDataURL = vi.fn();
  const mockRequestRender = vi.fn();
  const mockViewerIsDestroyed = vi.fn(() => false);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        render: mockViewerRender,
        isDestroyed: mockViewerIsDestroyed,
        scene: {
          requestRender: mockRequestRender,
        },
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
  expect(mockRequestRender).toHaveBeenCalledTimes(1);
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

test("onTick", () => {
  const d = new Date();
  const mockTickEventHandler = vi.fn(e => e);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.onTick(mockTickEventHandler);
  expect(result.current.current?.tickEventCallback?.current).toEqual([mockTickEventHandler]);

  result.current.current?.tickEventCallback?.current?.[0]?.(d, {
    start: new Date(),
    stop: new Date(),
  });
  expect(mockTickEventHandler).toHaveBeenCalledTimes(1);

  result.current.current?.removeTickEventListener(mockTickEventHandler);
  expect(result.current.current?.tickEventCallback?.current).toHaveLength(0);
});
