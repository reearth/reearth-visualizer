import { objectFromGetter } from "@reearth/util/object";

import type { Layer } from "../Primitive";

// Layer objects but optimized for plugins
type PluginLayer = Readonly<Layer>;

export class LayerStore {
  constructor(root: Layer) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.#prototype = objectFromGetter<Omit<Layer, "id">>(
      [
        "children",
        "extensionId",
        "infobox",
        "isVisible",
        "pluginId",
        "property",
        "propertyId",
        "title",
        "type",
      ],
      function (key) {
        const id = (this as any).id;
        if (this !== self.#proot && !id) throw new Error("layer ID is not specified");
        const target = this === self.#proot ? self.#root : self.#map.get(id);

        if (key === "children") {
          return target?.children?.map(c => self.#pmap.get(c.id));
        }

        if (key === "type") {
          return target
            ? `${
                !target.pluginId || target.pluginId === "reearth"
                  ? ""
                  : `${target.pluginId.replace(/#.*?$|^.*~/g, "")}/`
              }${target.extensionId || ""}`
            : undefined;
        }

        return target?.[key];
      },
    );

    this.#root = root;
    this.#proot = this.#pluginLayer(root);
    this.#flattenLayers = flattenLayers(root?.children ?? []);
    this.#map = new Map(this.#flattenLayers.map(l => [l.id, l]));
    this.#pmap = new Map(this.#flattenLayers.map(l => [l.id, this.#pluginLayer(l)]));
  }

  #root: Layer;
  #proot: PluginLayer;
  #flattenLayers: Layer[];
  #map: Map<string, Layer>;
  #pmap: Map<string, PluginLayer>;
  #prototype: Readonly<Omit<Layer, "id">>;

  #pluginLayer(layer: Layer): PluginLayer {
    // use getter and setter
    const l = Object.create(this.#prototype);
    l.id = layer.id;
    return l;
  }

  isLayer = (obj: any): obj is PluginLayer => {
    return typeof obj === "object" && Object.getPrototypeOf(obj) === this.#prototype;
  };

  findById = (id: string): PluginLayer | undefined => {
    return this.#pmap.get(id);
  };

  findByIds = (...ids: string[]): (PluginLayer | undefined)[] => {
    return ids.map(id => this.findById(id));
  };

  find = (
    fn: (layer: PluginLayer, index: number, parents: PluginLayer[]) => boolean,
  ): PluginLayer | undefined => {
    return this.walk((...args) => (fn(...args) ? args[0] : undefined));
  };

  findAll = (
    fn: (layer: PluginLayer, index: number, parents: PluginLayer[]) => boolean,
  ): PluginLayer[] => {
    const res: PluginLayer[] = [];
    this.walk((...args) => {
      if (fn(...args)) res.push(args[0]);
    });
    return res;
  };

  walk = <T>(
    fn: (layer: PluginLayer, index: number, parents: PluginLayer[]) => T | void,
  ): T | undefined => {
    function w(layers: PluginLayer[], parents: PluginLayer[]): T | undefined {
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        const res =
          fn(l, i, parents) ??
          (Array.isArray(l.children) && l.children.length > 0
            ? w(l.children, [...parents, l])
            : undefined);
        if (typeof res !== "undefined") {
          return res;
        }
      }
      return undefined;
    }

    if (!this.#proot.children) return;
    return w(this.#proot.children, [this.#proot]);
  };

  get root(): PluginLayer {
    return this.#proot;
  }

  get flattenLayersRaw(): Layer[] {
    return this.#flattenLayers;
  }
}

function flattenLayers(layers: Layer[] | undefined): Layer[] {
  return (
    layers?.reduce<Layer[]>(
      (a: Layer[], b: Layer): Layer[] => [
        ...a,
        b,
        ...(b.isVisible ? flattenLayers(b.children) ?? [] : []),
      ],
      [],
    ) ?? []
  );
}

export const empty = new LayerStore({ id: "" });
