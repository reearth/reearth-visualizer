import { useRef, useState, useCallback, useEffect } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import { Camera } from "@reearth/util/value";

type Params = {
  cameraValue: Camera | undefined;
  onSubmit?: (value: Camera) => void;
  isCapturing?: boolean;
  onIsCapturingChange?: (isCapturing: boolean) => void;
  cameraState?: Camera;
  onCameraChange?: (camera: Partial<Camera>) => void;
  disabled?: boolean;
  onlyPose?: boolean;
};

export default ({
  cameraValue,
  onSubmit,
  isCapturing,
  onIsCapturingChange,
  cameraState,
  onCameraChange,
  disabled,
  onlyPose,
}: Params) => {
  const camera = isCapturing ? cameraState : cameraValue;
  const [open, setOpen] = useState(false);

  const openPopup = useCallback(() => setOpen(true), [setOpen]);
  const closePopup = useCallback(() => setOpen(false), [setOpen]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cameraWrapperRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLUListElement>(null);
  const { styles, attributes } = usePopper(cameraWrapperRef.current, popperRef.current, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
      {
        name: "eventListeners",
        enabled: !open,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  useEffect(() => {
    if (!isCapturing) closePopup();
  }, [isCapturing, openPopup, closePopup]);

  const startCapture = useCallback(() => {
    if (disabled) return;
    openPopup();
    onIsCapturingChange?.(true);
  }, [disabled, onIsCapturingChange, openPopup]);

  const finishCapture = useCallback(() => {
    closePopup();
    onIsCapturingChange?.(false);
  }, [closePopup, onIsCapturingChange]);

  const updateCamera = useCallback(
    (value: Partial<Camera>) => !disabled && value && onCameraChange?.(value),
    [disabled, onCameraChange],
  );

  const cancelCapture = useCallback(() => {
    finishCapture();
  }, [finishCapture]);

  const submitCapture = useCallback(() => {
    if (disabled) return;
    finishCapture();
    if (cameraState) {
      onSubmit?.(cameraState);
      updateCamera(cameraState);
    }
  }, [disabled, finishCapture, cameraState, onSubmit, updateCamera]);

  const handleLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ lat: Number(e.target.value) }),
    [updateCamera],
  );

  const handleLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ lng: Number(e.target.value) }),
    [updateCamera],
  );

  const updateAltitude = useCallback(
    (fov: number) => updateCamera({ height: Math.max(500, Math.min(fov, 10 ** 10)) }),
    [updateCamera],
  );

  const handleAltitudeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateAltitude(Number(e.target.value)),
    [updateAltitude],
  );

  const handleHeadingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ heading: Number(e.target.value) }),
    [updateCamera],
  );

  const handlePitchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ pitch: Number(e.target.value) }),
    [updateCamera],
  );

  const handleRollChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateCamera({ roll: Number(e.target.value) }),
    [updateCamera],
  );

  const handleClickCancelButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      cancelCapture();
    },
    [cancelCapture],
  );

  const handleClickSubmitButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      submitCapture();
    },
    [submitCapture],
  );

  const isAwayTarget = useCallback((e: Event) => {
    const target = e.target as HTMLElement | null;
    const popups = Array.from(document.querySelectorAll("[data-camera-popup]"));
    return !popups.some(element => element.contains(target));
  }, []);

  useClickAway(wrapperRef, e => {
    if (isAwayTarget(e) && isCapturing) {
      cancelCapture();
      closePopup();
    }
  });

  const jump = useCallback(() => {
    if (!cameraValue) return;
    onCameraChange?.(
      onlyPose
        ? {
            height: cameraValue.height,
            heading: cameraValue.heading,
            pitch: cameraValue.pitch,
            roll: cameraValue.roll,
            fov: cameraValue.fov,
          }
        : cameraValue,
    );
  }, [cameraValue, onCameraChange, onlyPose]);

  return {
    wrapperRef,
    cameraWrapperRef,
    popper: {
      ref: popperRef,
      styles: styles.popper,
      attributes,
    },
    camera,
    open,
    openPopup,
    startCapture,
    updateCamera,
    handleLatChange,
    handleLngChange,
    handleAltitudeChange,
    handleHeadingChange,
    handlePitchChange,
    handleRollChange,
    handleClickCancelButton,
    handleClickSubmitButton,
    jump,
  };
};
