import { useCallback, useMemo, useState } from "react";

import { LayerAppearanceTypes } from "@reearth/beta/lib/core/mantle";
import { useAppearancesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";

type useAppearanceProps = {
  sceneId: string;
};

export type AppearanceAddProps = {
  name: string;
  value?: Partial<LayerAppearanceTypes>;
};

export type AppearanceNameUpdateProps = {
  styleId: string;
  name: string;
};

export type AppearanceValueUpdateProps = {
  styleId: string;
  value: Partial<LayerAppearanceTypes>;
};

export default function ({ sceneId }: useAppearanceProps) {
  const t = useT();
  const { useAddAppearance, useGetAppearancesQuery, useRemoveAppearance, useUpdateAppearance } =
    useAppearancesFetcher();
  const [selectedAppearanceId, setSelectedAppearanceId] = useState<string | undefined>(undefined);
  const { appearances = [] } = useGetAppearancesQuery({ sceneId });

  const selectedAppearance = useMemo(
    () => appearances.find(l => l.id === selectedAppearanceId) || undefined,
    [appearances, selectedAppearanceId],
  );

  const handleAppearanceSelect = useCallback(
    (layerId: string) =>
      setSelectedAppearanceId(prevId => (prevId === layerId ? undefined : layerId)),
    [],
  );

  const handleAppearanceDelete = useCallback(
    async (styleId: string) => {
      if (!selectedAppearance) return;
      const deletedPageIndex = appearances.findIndex(l => l.id === styleId);

      await useRemoveAppearance({
        styleId: selectedAppearance.id,
      });
      if (styleId === selectedAppearanceId) {
        setSelectedAppearanceId(
          appearances[deletedPageIndex + 1]?.id ?? appearances[deletedPageIndex - 1]?.id,
        );
      }
    },
    [appearances, selectedAppearance, selectedAppearanceId, useRemoveAppearance],
  );

  const handleAppearanceAdd = useCallback(
    async (inp: AppearanceAddProps) => {
      await useAddAppearance({
        sceneId: sceneId,
        name: t(inp.name),
        value: inp.value,
      });
    },
    [sceneId, t, useAddAppearance],
  );

  const handleAppearanceNameUpdate = useCallback(
    async (inp: AppearanceNameUpdateProps) => {
      await useUpdateAppearance({
        styleId: inp.styleId,
        name: inp.name,
      });
    },
    [useUpdateAppearance],
  );

  const handleAppearanceValueUpdate = useCallback(
    async (inp: AppearanceValueUpdateProps) => {
      await useUpdateAppearance({
        styleId: inp.styleId,
        value: inp.value,
      });
    },
    [useUpdateAppearance],
  );

  return {
    appearances,
    selectedAppearance,
    setSelectedAppearanceId,
    handleAppearanceAdd,
    handleAppearanceDelete,
    handleAppearanceSelect,
    handleAppearanceNameUpdate,
    handleAppearanceValueUpdate,
  };
}
