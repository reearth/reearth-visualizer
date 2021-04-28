import { useDrag } from "@reearth/util/use-dnd";

export default (onDrop?: (layerId: string, index?: number) => void) => {
  const { ref } = useDrag<"datasetSchema">(
    { type: "datasetSchema" },
    false,
    async (item, dropper) => {
      if (!dropper || (dropper.type !== "earth" && dropper.type !== "layer")) return;
      onDrop?.(dropper.layerId, dropper.type === "layer" ? dropper.index : undefined);
    },
  );

  return ref;
};
