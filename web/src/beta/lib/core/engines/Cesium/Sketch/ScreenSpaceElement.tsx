import { Cartesian2, Cartesian3, Ellipsoid, EllipsoidalOccluder } from "@cesium/engine";
import { motion, useMotionValue } from "framer-motion";
import { forwardRef, useRef, type ComponentPropsWithRef } from "react";
import { useMergeRefs } from "use-callback-ref";

import { useConstant } from "@reearth/beta/utils/util";
import { styled } from "@reearth/services/theme";

import { useVisualizer } from "../../../Visualizer";
import { usePreRender } from "../hooks/useSceneEvent";

const Root = styled(motion.div)({
  position: "absolute",
  pointerEvents: "none",
  left: 0,
  top: 0,
});

export interface ScreenSpaceElementProps extends ComponentPropsWithRef<typeof Root> {
  position?: Cartesian3;
  children?: React.ReactNode;
}

const occluder = new EllipsoidalOccluder(Ellipsoid.WGS84, Cartesian3.ZERO);

const ScreenSpaceElement = forwardRef<HTMLDivElement, ScreenSpaceElementProps>(
  ({ position: positionProp, children, ...props }, forwardedRef) => {
    const position = useConstant(() => new Cartesian3());
    positionProp?.clone(position);

    const motionTransform = useMotionValue("");
    const motionDisplay = useMotionValue("none");

    const visualizer = useVisualizer();

    const ref = useRef<HTMLDivElement>(null);

    usePreRender(() => {
      if (ref.current == null) {
        return;
      }
      let windowPosition;
      try {
        const pos = visualizer.current?.engine.toWindowPosition([
          position.x,
          position.y,
          position.z,
        ]);
        windowPosition = new Cartesian2(pos?.[0], pos?.[1]);
      } catch (error) {
        motionDisplay.set("none");
        return;
      }

      const camera = visualizer.current?.engine.getCamera();
      if (!camera) return;
      const xyz = visualizer.current?.engine.toXYZ(camera?.lng, camera?.lat, camera?.height);
      if (!xyz) return;
      occluder.cameraPosition = new Cartesian3(xyz[0], xyz[1], xyz[2]);
      if (
        windowPosition == null ||
        windowPosition.x < 0 ||
        windowPosition.y < 0 ||
        windowPosition.x > window.innerWidth ||
        windowPosition.y > window.innerHeight ||
        !occluder.isPointVisible(position)
      ) {
        motionDisplay.set("none");
        return;
      }
      const x = `calc(${windowPosition.x}px - 50%)`;
      const y = `calc(${windowPosition.y}px - 50%)`;
      motionTransform.set(`translate(${x}, ${y})`);
      motionDisplay.set("block");
    });

    const mergedRef = useMergeRefs([ref, forwardedRef]);

    return (
      <Root
        ref={mergedRef}
        {...props}
        style={{
          ...props.style,
          transform: motionTransform,
          display: motionDisplay,
        }}>
        {children}
      </Root>
    );
  },
);

ScreenSpaceElement.displayName = "ScreenSpaceElement";

export default ScreenSpaceElement;
