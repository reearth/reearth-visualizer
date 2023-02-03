import { expect, test } from "vitest";

import { heightReference, shadowMode } from "../../common";
import { toColor } from "../utils";

import { attachProperties } from "./utils";

test("attachProperties()", () => {
  const mockEntity: any = {
    polygon: {
      outlineWidth: 100,
      material: toColor("blue"),
    },
  };
  const mockComputedFeature: any = {
    polygon: {
      fillColor: "red",
      shadows: "enabled",
      heightReference: "clamp",
    },
  };

  attachProperties(mockEntity, mockComputedFeature, ["polygon", "polygon"], {
    material: {
      name: "fillColor",
      type: "color",
    },
    outlineWidth: {
      name: "strokeWidth",
    },
    shadows: {
      name: "shadows",
      type: "shadows",
    },
    heightReference: {
      name: "heightReference",
      type: "heightReference",
    },
  });

  expect(mockEntity.polygon).toEqual({
    material: toColor("red"),
    shadows: shadowMode("enabled"),
    heightReference: heightReference("clamp"),
    outlineWidth: 100,
  });
  expect(mockEntity.properties.reearth_originalProperties).toEqual({
    polygon: {
      material: toColor("blue"),
      outlineWidth: 100,
    },
  });

  // Computed feature should not be changed.
  expect(mockComputedFeature).toEqual({
    polygon: {
      fillColor: "red",
      shadows: "enabled",
      heightReference: "clamp",
    },
  });
});
