import { InfoboxBlock } from "@reearth/app/features/Visualizer/Crust/Infobox/types";
import type { Layer } from "@reearth/core";
import { NLSInfobox } from "@reearth/services/api/layer/types";
import { convert } from "@reearth/services/api/property/utils";

import { processProperty } from "./convert";
import { processProperty as processNewProperty } from "./processNewProperty";

export default (
  orig: NLSInfobox | null | undefined,
  parent: NLSInfobox | null | undefined,
  blockNames?: Record<string, string>
): Layer["infobox"] => {
  const used = orig || parent;
  if (!used) return;
  return {
    property: processNewProperty(parent?.property, orig?.property),
    blocks: used.blocks?.map<InfoboxBlock>((b) => ({
      id: b.id,
      name: blockNames?.[b.extensionId] ?? "Infobox Block",
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      extensionType: "infoboxBlock",
      property: processNewProperty(undefined, b.property),
      propertyForPluginAPI: processProperty(b.property),
      propertyId: b.propertyId, // required by onBlockChange
      propertyItemsForPluginBlock: convert(b.property)
    }))
  };
};
