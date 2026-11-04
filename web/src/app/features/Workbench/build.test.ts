import { describe, expect, it } from "vitest";

import { buildBlocks, buildStory, buildWidgets } from "./build";
import { fieldKey } from "./properties";
import type { PluginExtension } from "./types";

const widget = (id: string, area = "bottom"): PluginExtension => ({
  id,
  type: "widget",
  widgetLayout: {
    defaultLocation: { zone: "outer", section: "left", area } as never
  },
  schema: {
    groups: [
      { id: "g", fields: [{ id: "n", type: "number", defaultValue: 1 }] }
    ]
  }
});

describe("buildWidgets", () => {
  it("keeps every widget when several share one area", () => {
    const w = buildWidgets("p", [widget("a"), widget("b")], {});
    expect(
      w.alignSystem?.outer?.left?.bottom?.widgets?.map((x) => x.extensionId)
    ).toEqual(["a", "b"]);
  });

  it("passes stored values, and 0, to the widget's property", () => {
    const w = buildWidgets("p", [widget("a")], {
      [fieldKey("p", "a", "g", "n")]: 0
    });
    expect(w.alignSystem?.outer?.left?.bottom?.widgets?.[0].property).toEqual({
      g: { n: 0 }
    });
  });
});

describe("blocks and story", () => {
  const exts: PluginExtension[] = [
    { id: "s", type: "storyBlock" },
    { id: "i", type: "infoboxBlock" },
    widget("w")
  ];

  it("splits blocks by type", () => {
    expect(buildBlocks("p", exts, "infoboxBlock", {}).map((b) => b.id)).toEqual(
      ["p-i"]
    );
    expect(buildStory("p", exts, {})?.pages[0].blocks.map((b) => b.id)).toEqual(
      ["p-s"]
    );
  });

  it("has no story without story blocks", () => {
    expect(buildStory("p", [widget("w")], {})).toBeUndefined();
  });
});
