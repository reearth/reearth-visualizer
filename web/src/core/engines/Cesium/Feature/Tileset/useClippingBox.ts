import {
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  Cartesian2,
  Cartesian3,
  Entity,
  Cesium3DTileFeature,
} from "cesium";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RootEventTarget, useCesium } from "resium";

import { computeMoveAmount } from "@reearth/components/molecules/Visualizer/Engine/Cesium/Box/utils";
import { Camera, EXPERIMENTAL_clipping } from "@reearth/core/mantle";
import { LayerEditEvent } from "@reearth/core/Map";

import {
  getCamera,
  getLocationFromScreen,
  sampleTerrainHeight,
  updateMapController,
} from "../../common";
import { getTag } from "../utils";

type BoxState = {
  activeBox?: boolean;
  activeScalePointIndex?: number; // 0 ~ 11
  isScalePointClicked?: boolean;
  activeEdgeIndex?: number; // 0 ~ 4
  isEdgeClicked?: boolean;
  cursor?: string;
};

export const BUILTIN_BOX_SIDE_PLANES = [
  {
    normal: {
      x: 0,
      y: 0,
      z: 1,
    },
    distance: 0.5,
  },
  {
    normal: {
      x: 0,
      y: 0,
      z: -1,
    },
    distance: 0.5,
  },
  {
    normal: {
      x: 0,
      y: 1,
      z: 0,
    },
    distance: 0.5,
  },
  {
    normal: {
      x: 0,
      y: -1,
      z: 0,
    },
    distance: 0.5,
  },
  {
    normal: {
      x: 1,
      y: 0,
      z: 0,
    },
    distance: 0.5,
  },
  {
    normal: {
      x: -1,
      y: 0,
      z: 0,
    },
    distance: 0.5,
  },
];

export const useClippingBox = ({
  clipping,
  boxId,
}: {
  clipping?: EXPERIMENTAL_clipping;
  boxId: string;
}) => {
  const {
    useBuiltinBox,
    visible,
    allowEnterGround,
    coordinates,
    width,
    height,
    length,
    heading,
    pitch,
    roll,
  } = clipping || {};

  const { viewer } = useCesium();

  const isBoxClicked = useRef(false);
  const isTopBottomSidePlaneClicked = useRef(false);
  const currentCameraPosition = useRef<Camera | undefined>();

  // Coordinates
  const [coords, setCoords] = useState(coordinates);
  useEffect(() => {
    if (useBuiltinBox && !coords) {
      setCoords(coordinates);
    }
  }, [coords, coordinates, useBuiltinBox]);

  // Dimensions
  const [dimensions, setDimensions] = useState<
    Pick<EXPERIMENTAL_clipping, "width" | "height" | "length" | "heading" | "pitch" | "roll">
  >({ width, height, length, heading, pitch, roll });
  useEffect(() => {
    if (useBuiltinBox && !dimensions) {
      setDimensions({ width, height, length, heading, pitch, roll });
    }
  }, [dimensions, width, height, length, heading, pitch, roll, useBuiltinBox]);

  const [boxState, setBoxState] = useState<BoxState>({
    activeBox: false,
    activeScalePointIndex: undefined, // 0 ~ 11
    isScalePointClicked: false,
    activeEdgeIndex: undefined, // 0 ~ 4
    isEdgeClicked: false,
    cursor: "default", // grab | grabbing | default
  });

  const handleUpdateBoxState = useCallback((state: BoxState) => {
    setBoxState(v => ({ ...v, ...state }));
  }, []);

  const handleMouseDown = useCallback(
    (e: any) => {
      if (!viewer) {
        return;
      }
      const picked = viewer.scene.pick(e.position);
      const layerId = getLayerId(picked);

      // Handle scale box
      if (layerId?.startsWith(`${boxId}-scale-point`)) {
        const index = Number(layerId.split("-").slice(-1)[0]);
        handleUpdateBoxState({
          cursor: "nesw-resize",
          activeScalePointIndex: index,
          isScalePointClicked: true,
        });
      }
      // Handle edge
      if (layerId?.startsWith(`${boxId}-edge-draggable`)) {
        const index = Number(layerId.split("-").slice(-1)[0]);
        handleUpdateBoxState({
          cursor: "grabbing",
          activeEdgeIndex: index,
          isEdgeClicked: true,
        });
      }

      if (layerId?.startsWith(`${boxId}-plane`)) {
        isBoxClicked.current = true;
        isTopBottomSidePlaneClicked.current = layerId.endsWith("top") || layerId.endsWith("bottom");
      }
      if (isBoxClicked.current) {
        const cameraPosition = getCamera(viewer);
        currentCameraPosition.current = cameraPosition;

        updateMapController(viewer, false);

        if (!boxState.isScalePointClicked || !boxState.isEdgeClicked) {
          handleUpdateBoxState({
            cursor: "grabbing",
            activeBox: true,
          });
        }
      }
    },
    [boxId, boxState, handleUpdateBoxState, viewer],
  );
  const handleMouseUp = useCallback(() => {
    if (!viewer) {
      return;
    }
    if (boxState.activeScalePointIndex || boxState.activeEdgeIndex) {
      handleUpdateBoxState({
        cursor: "default",
        // Handle scale box
        activeScalePointIndex: undefined,
        isScalePointClicked: false,
        // Handle edge
        activeEdgeIndex: undefined,
        isEdgeClicked: false,
      });
    }

    if (isBoxClicked.current) {
      updateMapController(viewer, true);
      currentCameraPosition.current = undefined;
      isBoxClicked.current = false;
      isTopBottomSidePlaneClicked.current = false;

      boxState.activeBox = false;
      boxState.cursor = "default";
      handleUpdateBoxState({
        activeBox: false,
        cursor: "default",
      });
    }
  }, [boxState, handleUpdateBoxState, viewer]);
  const handleMouseMove = useCallback(
    async (e: any) => {
      if (!isBoxClicked.current || !viewer) return;

      const cart = Cartesian3.fromDegrees(coords?.[0] || 0, coords?.[1] || 0, coords?.[2]);

      if (isTopBottomSidePlaneClicked.current) {
        const locationHeight = coords?.[2] || 0;
        const terrainHeight = await (async () => {
          if (!allowEnterGround) {
            const boxBottomHeight = locationHeight - (dimensions?.height || 0) / 2;
            const floorHeight =
              (await sampleTerrainHeight(viewer.scene, coords?.[0] || 0, coords?.[1] || 0)) || 0;
            if (boxBottomHeight < floorHeight) {
              return boxBottomHeight + (floorHeight - boxBottomHeight);
            }
          }
          return 0;
        })();

        const prevMousePosition = new Cartesian2(e.startPosition.x, e.startPosition.y);
        const currentMousePosition = new Cartesian2(e.endPosition.x, e.endPosition.y);

        const vector = Cartesian2.subtract(
          currentMousePosition,
          prevMousePosition,
          new Cartesian2(),
        );
        const direction = new Cartesian3(0, 0, vector.y < 0 ? -1 : 1);

        const { moveAmount } = computeMoveAmount(
          viewer.scene,
          {
            startPosition: prevMousePosition,
            endPosition: currentMousePosition,
          },
          cart,
          direction,
        );
        const moveVector = Cartesian3.multiplyByScalar(direction, moveAmount, new Cartesian3());
        setCoords(v => [
          v?.[0] || 0,
          v?.[1] || 0,
          (terrainHeight ? terrainHeight : v?.[2] || 0) + moveVector.z,
        ]);
      } else {
        const position = e.endPosition
          ? getLocationFromScreen(viewer.scene, e.endPosition.x, e.endPosition.y, true)
          : undefined;
        setCoords(v => [
          position?.lng || 0,
          position?.lat || 0,
          (!allowEnterGround ? position?.height : undefined) || v?.[2] || 0,
        ]);
      }
    },
    [allowEnterGround, coords, dimensions?.height, viewer],
  );
  const handleMouseEnter = useCallback(
    ({ layerId }: { layerId?: string } | undefined = {}) => {
      const enableEnterHandling =
        !boxState.isScalePointClicked && !boxState.isEdgeClicked && !isBoxClicked.current;
      // Handle scale box
      if (layerId?.startsWith(`${boxId}-scale-point`)) {
        if (enableEnterHandling) {
          const index = Number(layerId.split("-").slice(-1)[0]);
          handleUpdateBoxState({
            cursor: "nesw-resize",
            activeScalePointIndex: index,
          });
        }
      }
      // Handle edge
      if (layerId?.startsWith(`${boxId}-edge-draggable`)) {
        if (enableEnterHandling) {
          const index = Number(layerId.split("-").slice(-1)[0]);
          handleUpdateBoxState({
            cursor: "grab",
            activeEdgeIndex: index,
          });
        }
      }

      if (layerId?.startsWith(`${boxId}-plane`)) {
        if (enableEnterHandling) {
          handleUpdateBoxState({
            cursor: "grab",
            activeBox: true,
          });
        }
      }
    },
    [boxId, boxState.isEdgeClicked, boxState.isScalePointClicked, handleUpdateBoxState],
  );

  const handleMouseLeave = useCallback(
    ({ layerId }: { layerId?: string } | undefined = {}) => {
      const enableLeaveHandling =
        !boxState.isScalePointClicked && !boxState.isEdgeClicked && !isBoxClicked.current;
      // Handle scale box
      if (layerId?.startsWith(`${boxId}-scale-point`)) {
        if (enableLeaveHandling) {
          handleUpdateBoxState({
            cursor: "default",
            activeScalePointIndex: undefined,
          });
        }
      }
      // Handle edge
      if (layerId?.startsWith(`${boxId}-edge-draggable`)) {
        if (enableLeaveHandling) {
          handleUpdateBoxState({
            cursor: "default",
            activeEdgeIndex: undefined,
          });
        }
      }

      if (layerId?.startsWith(`${boxId}-plane`)) {
        if (enableLeaveHandling) {
          handleUpdateBoxState({
            cursor: "default",
            activeBox: false,
          });
        }
      }
    },
    [boxId, boxState.isEdgeClicked, boxState.isScalePointClicked, handleUpdateBoxState],
  );

  const hovered = useRef<any>();
  const handleRawMouseMove = useCallback(
    (e: any) => {
      const picked = viewer?.scene.pick(e.endPosition);

      if (hovered.current !== picked) {
        if (hovered.current) {
          const layerId = getLayerId(hovered.current);
          handleMouseLeave({ layerId });
          handleMouseLeave();
        }

        if (picked) {
          const layerId = getLayerId(picked);
          handleMouseEnter({ layerId });
          handleMouseEnter();
        }
      }

      handleMouseMove(e);

      hovered.current = picked;
    },
    [handleMouseEnter, handleMouseLeave, handleMouseMove, viewer?.scene],
  );

  const handleLayerEdit = useCallback(
    (e: LayerEditEvent) => {
      if (e.layerId?.startsWith(`${boxId}-scale-point`) && e.scale) {
        const scale = e.scale;

        setDimensions(v => ({
          ...v,
          width: scale.width,
          height: scale.height,
          length: scale.length,
        }));

        setCoords([scale.location.lng, scale.location.lat, scale.location.height]);
      }

      if (e.layerId?.startsWith(`${boxId}-edge-draggable`) && e.rotate) {
        const rotate = e.rotate;

        setDimensions(v => ({
          ...v,
          heading: rotate.heading,
          pitch: rotate.pitch,
          roll: rotate.roll,
        }));
      }
    },
    [boxId],
  );

  const eventHandler = useMemo(() => new ScreenSpaceEventHandler(viewer?.scene.canvas), [viewer]);
  useEffect(() => {
    eventHandler.setInputAction(handleMouseDown, ScreenSpaceEventType.LEFT_DOWN);
    eventHandler.setInputAction(handleRawMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    eventHandler.setInputAction(handleMouseUp, ScreenSpaceEventType.LEFT_UP);
  }, [eventHandler, handleMouseDown, handleRawMouseMove, handleMouseUp]);

  useEffect(() => () => eventHandler.destroy(), [eventHandler]);

  const boxProperty = useMemo(() => ({ ...boxState, ...dimensions }), [boxState, dimensions]);
  const builtinBoxProps = useMemo(
    () =>
      useBuiltinBox
        ? {
            visible,
            handleLayerEdit,
            geometry: {
              type: "Point" as const,
              coordinates: coords || coordinates || [0, 0, 0],
            },
            property: boxProperty,
          }
        : undefined,
    [boxProperty, coordinates, coords, handleLayerEdit, useBuiltinBox, visible],
  );

  return {
    ...clipping,
    planes: useBuiltinBox ? BUILTIN_BOX_SIDE_PLANES : clipping?.planes,
    width: useBuiltinBox ? dimensions?.width : clipping?.width,
    height: useBuiltinBox ? dimensions?.height : clipping?.height,
    length: useBuiltinBox ? dimensions?.length : clipping?.length,
    heading: useBuiltinBox ? dimensions?.heading : clipping?.heading,
    pitch: useBuiltinBox ? dimensions?.pitch : clipping?.pitch,
    roll: useBuiltinBox ? dimensions?.roll : clipping?.roll,
    coordinates: useBuiltinBox ? coords : clipping?.coordinates,
    builtinBoxProps,
  };
};

function getLayerId(target: RootEventTarget): string | undefined {
  if (target && "id" in target && target.id instanceof Entity) {
    return getTag(target.id)?.layerId;
  } else if (target && target instanceof Cesium3DTileFeature) {
    return getTag(target.tileset)?.layerId;
  }
  return undefined;
}
