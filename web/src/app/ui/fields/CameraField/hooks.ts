import { Camera } from "@reearth/app/utils/value";
import { useCallback, useEffect, useState } from "react";

export const degreesToRadians = (degrees: number): number =>
  degrees * (Math.PI / 180);

export const radiansToDegrees = (radians: number): number =>
  radians * (180 / Math.PI);

export const handleCameraeRadianToDegree = (camera: Camera) => ({
  lat: camera.lat,
  lng: camera.lng,
  height: camera.height,
  heading: radiansToDegrees(camera.heading),
  pitch: radiansToDegrees(camera.pitch),
  roll: radiansToDegrees(camera.roll),
  fov: camera?.fov
});

export const handleCameraDegreeToRadian = (camera: Camera) => ({
  lat: camera.lat,
  lng: camera.lng,
  height: camera.height,
  heading: degreesToRadians(camera.heading),
  pitch: degreesToRadians(camera.pitch),
  roll: degreesToRadians(camera.roll),
  fov: camera?.fov
});

const defaultCamera: Camera = {
  lat: 0,
  lng: 0,
  height: 0,
  heading: 0,
  pitch: 0,
  roll: 0,
  fov: 1
};

export default ({
  camera,
  onFlyTo,
  onSave,
  onClose
}: {
  camera?: Camera;
  onFlyTo?: (c?: Camera) => void;
  onSave: (value?: Camera) => void;
  onClose?: () => void;
}) => {
  const [newCamera, setNewCamera] = useState<Camera>(
    camera ? handleCameraeRadianToDegree(camera) : defaultCamera
  );

  useEffect(() => {
    if (!newCamera && camera) {
      setNewCamera(handleCameraeRadianToDegree(camera));
    }
  }, [newCamera, camera]);

  const handleFieldBlur = useCallback(
    (key: keyof Camera, update?: number) => {
      if (update === undefined || !newCamera) return;
      const updated: Camera = {
        ...newCamera,
        [key]: update
      };
      onFlyTo?.(handleCameraDegreeToRadian(updated));
    },
    [newCamera, onFlyTo]
  );

  const handleFieldChange = useCallback((key: keyof Camera, value?: number) => {
    setNewCamera((prev) => (prev ? { ...prev, [key]: value } : defaultCamera));
  }, []);

  const handleSave = useCallback(() => {
    if (!newCamera) return;
    const data = handleCameraDegreeToRadian(newCamera);
    if (JSON.stringify(newCamera) === JSON.stringify(defaultCamera)) {
      onFlyTo?.(data);
    }
    onSave?.(data);
    onClose?.();
  }, [newCamera, onClose, onFlyTo, onSave]);

  const handleTwinFieldChange = (values: [number, number]) => {
    handleFieldChange("lat", values[0]);
    handleFieldChange("lng", values[1]);
  };

  const handleTrippleFieldChange = (values: [number, number, number]) => {
    handleFieldChange("heading", values[0]);
    handleFieldChange("pitch", values[1]);
    handleFieldChange("roll", values[2]);
  };

  const handleTwinFieldBlur = (values: [number, number]) => {
    handleFieldBlur("lat", values[0]);
    handleFieldBlur("lng", values[1]);
  };

  const handleTrippleFieldBlur = (values: [number, number, number]) => {
    handleFieldBlur("heading", values[0]);
    handleFieldBlur("pitch", values[1]);
    handleFieldBlur("roll", values[2]);
  };

  const handleFOVChange = (value: number) => {
    handleFieldChange("fov", value);
    handleFieldBlur("fov", value);
  };

  return {
    newCamera,
    handleTwinFieldBlur,
    handleTwinFieldChange,
    handleTrippleFieldChange,
    handleTrippleFieldBlur,
    handleFieldChange,
    handleFieldBlur,
    handleFOVChange,
    handleSave
  };
};
