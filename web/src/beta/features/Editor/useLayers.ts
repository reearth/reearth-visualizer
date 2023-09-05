import { useCallback, useMemo, useState } from "react";

import { useLayersFetcher } from "@reearth/services/api";
import { NlsLayerCommonFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId: string;
  layers: NlsLayerCommonFragment[];
};

export type LayerAddProps = {
  config?: any;
  index?: any;
  layerType: string;
  sceneId: string;
  title: string;
  visible?: boolean;
};

export type LayerUpdateProps = {
  layerId: string;
  name: string;
  visible?: boolean;
};

export default function ({ layers }: Props) {
  const t = useT();
  const { useAddNLSLayerSimple, useRemoveNLSLayer, useUpdateNLSLayer } = useLayersFetcher();
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>(undefined);

  const selectedLayer = useMemo(() => {
    return layers.length ? layers[0] : undefined;
  }, [layers]);

  const handleLayerSelect = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
  }, []);

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      if (!selectedLayer) return;
      const deletedPageIndex = layers.findIndex(l => l.id === layerId);

      await useRemoveNLSLayer({
        layerId: selectedLayer.id,
      });
      if (layerId === selectedLayerId) {
        setSelectedLayerId(layers[deletedPageIndex + 1]?.id ?? layers[deletedPageIndex - 1]?.id);
      }
    },
    [layers, selectedLayer, selectedLayerId, useRemoveNLSLayer],
  );

  const handleLayerAdd = useCallback(
    async (inp: LayerAddProps) => {
      await useAddNLSLayerSimple({
        sceneId: inp.sceneId,
        config: inp.config,
        visible: inp.visible,
        layerType: inp.layerType,
        title: t(inp.title),
        index: inp.index,
      });
    },
    [t, useAddNLSLayerSimple],
  );

  const handleLayerUpdate = useCallback(
    async (inp: LayerUpdateProps) => {
      if (!selectedLayer) return;
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        name: inp.name,
        visible: inp.visible,
      });
    },
    [selectedLayer, useUpdateNLSLayer],
  );

  return {
    selectedLayer,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerUpdate,
  };
}
