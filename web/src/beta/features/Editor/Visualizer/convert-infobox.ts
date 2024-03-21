import { InfoboxBlock } from "@reearth/beta/lib/core/Crust/Infobox/types";
import type { Layer } from "@reearth/beta/lib/core/Map";
import { NLSInfobox } from "@reearth/services/api/layersApi/utils";

import { processProperty as processNewProperty } from "./processNewProperty";

export default (
  orig: NLSInfobox | null | undefined,
  parent: NLSInfobox | null | undefined,
  blockNames?: {
    [key: string]: string;
  },
): Layer["infobox"] => {
  const used = orig || parent;
  if (!used) return;
  return {
    property: processNewProperty(parent?.property, orig?.property),
    blocks: used.blocks?.map<InfoboxBlock>(b => ({
      id: b.id,
      name: blockNames?.[b.extensionId] ?? "Infobox Block",
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      property: processNewProperty(undefined, b.property),
      propertyId: b.propertyId, // required by onBlockChange
    })),
  };
};
