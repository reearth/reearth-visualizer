import { useMemo } from "react";
import { useGetPrimitivesQuery, useAddLayerItemFromPrimitiveMutation } from "@reearth/gql";
import { useSceneId, useSelected } from "@reearth/state";

// ポリゴンやポリラインは現在編集できないため、それらを新規レイヤーとして追加しても何も表示されない
const hiddenExtensions = ["reearth/polyline", "reearth/polygon", "reearth/rect"];

export default () => {
  const [sceneId] = useSceneId();
  const [, select] = useSelected();

  const { loading, data } = useGetPrimitivesQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const [addLayerItemFromPrimitiveMutation] = useAddLayerItemFromPrimitiveMutation();

  const primitives = useMemo(
    () =>
      (data?.node?.__typename === "Scene" ? data.node.plugins : undefined)
        ?.map(plugin => {
          const p = plugin.plugin;
          return (
            p?.extensions.map(e => ({
              ...e,
              pluginId: p.id,
            })) ?? []
          );
        })
        .reduce((a, b) => [...a, ...b], [])
        .filter(
          e =>
            e.type === "PRIMITIVE" && !hiddenExtensions.includes(e.pluginId + "/" + e.extensionId),
        )
        .map(e => ({
          id: `${sceneId}/sp/${e.pluginId}/${e.extensionId}`,
          name: e.translatedName,
          description: e.translatedDescription,
          icon: e.icon || e.extensionId,
          onDrop: async (
            layerId?: string,
            index?: number,
            location?: { lat: number; lng: number },
          ) => {
            if (!sceneId || !layerId) return;
            const { data } = await addLayerItemFromPrimitiveMutation({
              variables: {
                parentLayerId: layerId,
                pluginId: e.pluginId,
                extensionId: e.extensionId,
                name: e.translatedName,
                index,
                ...(location
                  ? {
                      lat: location.lat,
                      lng: location.lng,
                    }
                  : {}),
              },
              refetchQueries: ["GetLayers"],
            });

            const selectedLayer = data?.addLayerItem?.layer.id;
            if (selectedLayer) {
              select({ type: "layer", layerId: selectedLayer });
            }
          },
        })),
    [addLayerItemFromPrimitiveMutation, data?.node, sceneId, select],
  );

  return {
    loading,
    primitives,
  };
};
