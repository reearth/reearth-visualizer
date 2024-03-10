import { useCallback, useEffect, useMemo, useState } from "react";

import { useT } from "@reearth/services/i18n";

import type { Camera, RowType } from "../types";
import { saveFriendlyCamera, userFriendlyCamera } from "../utils";

export default ({
  camera,
  onFlyTo,
  onSave,
}: {
  camera?: Camera;
  onFlyTo?: (c?: Camera) => void;
  onSave: (value?: Camera) => void;
}) => {
  const t = useT();
  const [newCamera, setNewCamera] = useState<Camera | undefined>(
    camera ? userFriendlyCamera(camera) : undefined,
  );

  useEffect(() => {
    if (!newCamera && camera) {
      setNewCamera(userFriendlyCamera(camera));
    }
  }, [newCamera, camera]);

  const handleFieldUpdate = useCallback(
    (key: keyof Camera, update?: number) => {
      if (update === undefined || !newCamera) return;
      const updated: Camera = {
        ...newCamera,
        [key]: update,
      };
      setNewCamera(updated);
      onFlyTo?.(saveFriendlyCamera(updated));
    },
    [newCamera, onFlyTo],
  );

  const panelContent: { [key: string]: RowType } = useMemo(() => {
    return {
      [t("Location")]: [
        { id: "lat", description: t("Latitude") },
        { id: "lng", description: t("Longitude") },
      ],
      [t("Height")]: [{ id: "height", suffix: "km" }],
      [t("Rotation")]: [
        { id: "heading", description: t("Heading") },
        { id: "pitch", description: t("Pitch") },
        { id: "roll", description: t("Roll") },
      ],
    };
  }, [t]);

  const handleChange = useCallback(
    (field: keyof Camera) => (value?: number) => {
      if (value === newCamera?.[field]) return;
      handleFieldUpdate(field, value);
    },
    [newCamera, handleFieldUpdate],
  );

  const handleSave = useCallback(() => {
    if (!newCamera) return;
    const saveFriendly = saveFriendlyCamera(newCamera);
    onSave?.(saveFriendly);
  }, [newCamera, onSave]);

  return {
    newCamera,
    panelContent,
    handleChange,
    handleSave,
  };
};
