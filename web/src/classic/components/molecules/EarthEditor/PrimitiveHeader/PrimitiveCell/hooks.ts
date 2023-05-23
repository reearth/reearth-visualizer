import { useDrag } from "@reearth/classic/util/use-dnd";

export default (
  onDrop?: (
    layerId?: string,
    index?: number,
    location?: {
      lat: number;
      lng: number;
      height: number;
    },
  ) => void,
) => {
  const { ref } = useDrag<"primitive">({ type: "primitive" }, false, async (item, dropper) => {
    const layerId =
      (dropper?.type !== "earth" && dropper?.type !== "layer") ||
      (dropper?.type === "earth" && !dropper.position)
        ? undefined
        : dropper.layerId;
    onDrop?.(
      layerId,
      dropper?.type === "layer" ? dropper.index : undefined,
      dropper?.type === "earth" ? dropper.position : undefined,
    );
  });

  return { ref };
};
