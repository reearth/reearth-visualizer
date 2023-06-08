import { MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";

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
  onMoveOrbit,
  onStartOrbit,
  onEndOrbit,
}: {
  degree: number;
  onRotate?: (degree: number) => void;
  onMoveOrbit?: (degree: number) => void;
  onStartOrbit?: () => void;
  onEndOrbit?: () => void;
}) => {
  const [compassDegree, setCompassDegree] = useState(0);
  const [compassFocusDegree, setCompassFocusDegree] = useState(0);
  const compassRef = useRef<HTMLDivElement | null>(null);
  const isRotatingRef = useRef(false);
  const shouldIncrementCompassDegreeOnMovingAngle = useRef(false);
  const [isMovingAngle, setIsMovingAngle] = useState(false);
  const isMovingAngleRef = useReferredValue(isMovingAngle);
  const onRotateRef = useReferredValue(onRotate);
  const onMoveOrbitRef = useReferredValue(onMoveOrbit);
  const onStartOrbitRef = useReferredValue(onStartOrbit);
  const onEndOrbitRef = useReferredValue(onEndOrbit);

  const handleOnMouseDownCompass: MouseEventHandler<HTMLDivElement> = useCallback(
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
      isRotatingRef.current = true;
      setCompassDegree(degree);
      onRotateRef.current?.(degree);
    },
    [onRotateRef],
  );

  const rotateCompassWhileMovingAngle = useCallback(() => {
    if (!isMovingAngleRef.current) {
      return;
    }
    setCompassDegree(prevDegree => {
      const next = shouldIncrementCompassDegreeOnMovingAngle.current
        ? prevDegree + 1
        : prevDegree - 1;
      return next;
    });
    window.requestAnimationFrame(rotateCompassWhileMovingAngle);
  }, [isMovingAngleRef]);

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
      setCompassFocusDegree(degree);
      onStartOrbitRef.current?.();
      onMoveOrbitRef.current?.(degree);

      rotateCompassWhileMovingAngle();
    },
    [rotateCompassWhileMovingAngle, onMoveOrbitRef, isMovingAngleRef, onStartOrbitRef],
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
      setCompassFocusDegree(degree);
      onMoveOrbitRef.current?.(degree);

      shouldIncrementCompassDegreeOnMovingAngle.current = 0 <= degree && degree <= 180;
    };
    const handleOnMouseUp = () => {
      isRotatingRef.current = false;
      onEndOrbitRef.current?.();
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
  }, [
    isMovingAngleRef,
    isRotatingRef,
    onStartOrbitRef,
    onEndOrbitRef,
    onMoveOrbitRef,
    onRotateRef,
  ]);

  useEffect(() => {
    if (!isRotatingRef.current && !isMovingAngleRef.current) {
      setCompassDegree(degree);
    }
  }, [degree, isMovingAngleRef]);

  return {
    compassRef,
    compassDegree,
    compassFocusDegree,
    isMovingAngle,
    handleOnMouseDownCompass,
    handleOnMouseDownAngle,
  };
};
