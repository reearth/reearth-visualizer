import { useCallback, useMemo } from "react";

import { useT } from "@reearth/services/i18n";

import type { Camera, RowType } from "../types";

export default ({
  camera,
  onChange,
}: {
  camera?: Camera;
  onChange?: (key: keyof Camera, update?: number) => void;
}) => {
  const t = useT();

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
      if (value === camera?.[field]) return;
      onChange?.(field, value);
    },
    [camera, onChange],
  );
  return {
    panelContent,
    handleChange,
  };
};
