import { MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";

import { CompassAngle } from "./types";
import { calculateDegreeOfCompass } from "./utils";

const useReferredValue = <T = unknown>(val: T) => {
  const valRef = useRef(val);

  useEffect(() => {
    valRef.current = val;
  }, [val]);

  return valRef;
};

export const useNavigator = ({
  degree,
  onRotate,
  onOrbit,
}: {
  degree: number;
  onRotate?: (degree: number) => void;
  onOrbit?: (angle: CompassAngle) => void;
}) => {
  const [compassDegree, setCompassDegree] = useState(0);
  const [compassFocusAngle, setCompassFocusAngle] = useState<CompassAngle>({
    x: 0,
    y: 0,
    degree: 0,
  });
  const compassRef = useRef<HTMLDivElement | null>(null);
  const isRotatingRef = useRef(false);
  const shouldIncrementCompassDegreeOnMovingAngle = useRef(false);
  const [isMovingAngle, setIsMovingAngle] = useState(false);
  const isMovingAngleRef = useReferredValue(isMovingAngle);
  const onRotateRef = useReferredValue(onRotate);
  const onOrbitRef = useReferredValue(onOrbit);

  const handleOnMouseDownCompass: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    const compass = compassRef.current;
    if (!compass) {
      return;
    }
    const rect = compass.getBoundingClientRect();
    const degree = calculateDegreeOfCompass(
      {
        x: rect.x,
        y: rect.y,
        height: compass.clientHeight,
        width: compass.clientWidth,
      },
      { x: e.clientX, y: e.clientY },
    );
    isRotatingRef.current = true;
    setCompassDegree(degree);
    onRotateRef.current?.(degree);
  }, []);

  const rotateCompassWhileMovingAngle = useCallback(() => {
    if (!isMovingAngleRef.current) {
      return;
    }
    setCompassDegree(prevDegree => {
      const next = shouldIncrementCompassDegreeOnMovingAngle.current
        ? prevDegree + 1
        : prevDegree - 1;
      onRotate?.(next);
      return next;
    });
    window.requestAnimationFrame(rotateCompassWhileMovingAngle);
  }, []);

  const handleOnMouseDownAngle: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      const compass = compassRef.current;
      if (!compass) {
        return;
      }
      const rect = compass.getBoundingClientRect();
      const degree = calculateDegreeOfCompass(
        {
          x: rect.x,
          y: rect.y,
          height: compass.clientHeight,
          width: compass.clientWidth,
        },
        { x: e.clientX, y: e.clientY },
      );
      setIsMovingAngle(true);
      isMovingAngleRef.current = true;
      setCompassFocusAngle({ x: e.clientX, y: e.clientY, degree });
      onOrbitRef.current?.({ x: e.clientX, y: e.clientY, degree });

      rotateCompassWhileMovingAngle();
    },
    [rotateCompassWhileMovingAngle],
  );

  useEffect(() => {
    const handleOnMouseMoveCompass = (e: MouseEvent) => {
      const compass = compassRef.current;
      if (!isRotatingRef.current || !compass) {
        return;
      }
      const rect = compass.getBoundingClientRect();
      const degree = calculateDegreeOfCompass(
        {
          x: rect.x,
          y: rect.y,
          height: compass.clientHeight,
          width: compass.clientWidth,
        },
        { x: e.clientX, y: e.clientY },
      );
      setCompassDegree(degree);
      onRotateRef.current?.(degree);
    };

    const handleOnMouseMoveAngle = (e: MouseEvent) => {
      const compass = compassRef.current;
      if (!isMovingAngleRef.current || !compass) {
        return;
      }
      const rect = compass.getBoundingClientRect();
      const degree = calculateDegreeOfCompass(
        {
          x: rect.x,
          y: rect.y,
          height: compass.clientHeight,
          width: compass.clientWidth,
        },
        { x: e.clientX, y: e.clientY },
      );
      setCompassFocusAngle({ x: e.clientX, y: e.clientY, degree });
      onOrbitRef.current?.({ x: e.clientX, y: e.clientY, degree });

      shouldIncrementCompassDegreeOnMovingAngle.current = 0 <= degree && degree <= 180;
    };
    const handleOnMouseUp = () => {
      isRotatingRef.current = false;
      setIsMovingAngle(false);
    };
    window.addEventListener("mousemove", handleOnMouseMoveCompass);
    window.addEventListener("mousemove", handleOnMouseMoveAngle);
    window.addEventListener("mouseup", handleOnMouseUp);
    return () => {
      window.addEventListener("mousemove", handleOnMouseMoveCompass);
      window.addEventListener("mousemove", handleOnMouseMoveAngle);
      window.addEventListener("mouseup", handleOnMouseUp);
    };
  }, []);

  useEffect(() => {
    setCompassDegree(degree);
  }, [degree]);

  return {
    compassRef,
    compassDegree,
    compassFocusAngle,
    isMovingAngle,
    handleOnMouseDownCompass,
    handleOnMouseDownAngle,
  };
};
