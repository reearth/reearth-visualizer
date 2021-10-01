import { objectFromGetter } from "@reearth/util/object";

import type { Layer } from "../Primitive";

// Layer objects but optimized for plugins
type PluginLayer = Readonly<Layer>;

export default class LayerStore {
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
      ],
      function (key) {
        const id = (this as any).id;
        if (this !== self.#proot && !id) throw new Error("layer ID is not specified");
        const target = this === self.#proot ? self.#root : self.#map.get(id);

        if (key === "children") {
          return target?.children?.map(c => self.#pmap.get(c.id));
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

  findById = (id: string): PluginLayer | undefined => {
    return this.#pmap.get(id);
  };

  findByIds = (...ids: string[]): (PluginLayer | undefined)[] => {
    return ids.map(id => this.findById(id));
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
    layers?.reduce<Layer[]>((a, b) => [...a, b, ...(b.isVisible ? b.children ?? [] : [])], []) ?? []
  );
}

export const empty = new LayerStore({ id: "" });
