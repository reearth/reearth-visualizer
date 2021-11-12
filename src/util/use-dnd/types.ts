export type ItemType = "layerItem" | "layerGroup" | "primitive" | "block" | "null";

export type Item<T extends ItemType = ItemType> = {
  null: { type: "null" };
  layerItem: {
    type: "layerItem";
    layerId: string;
    parentLayerId: string;
    index: number;
  };
  layerGroup: {
    type: "layerGroup";
    layerId: string;
    parentLayerId: string;
    index: number;
  };
  primitive: { type: "primitive" };
  block: {
    type: "block";
    id: string;
    index: number;
  };
}[T];

export type DropperType = "earth" | "layer" | "block";

export type Dropper<T extends DropperType = DropperType> = {
  earth: {
    type: "earth";
    layerId: string;
    position?: {
      lat: number;
      lng: number;
      height: number;
    };
  };
  layer: {
    type: "layer";
    layerId: string;
    index?: number;
  };
  block: {
    type: "block";
    id: string;
    index: number;
  };
}[T];
