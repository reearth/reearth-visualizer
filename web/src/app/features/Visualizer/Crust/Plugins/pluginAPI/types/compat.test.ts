import type {
  PluginInfoboxBlock,
  PluginStoryBlock,
  WidgetLayout
} from "@reearth/visualizer-plugin-api";
import { describe, expectTypeOf, it } from "vitest";

import type { PluginInfoboxBlock as InternalPluginInfoboxBlock } from "../../../Infobox/types";
import type { PluginStoryBlock as InternalPluginStoryBlock } from "../../../StoryPanel/types";
import type { WidgetLayout as InternalWidgetLayout } from "../../../Widgets/types";

// The package inlines simplified copies of these types, so the compiler is the
// only thing keeping them in sync. This is checked by `yarn type`.
describe("plugin API types", () => {
  it("accepts the app's internal types for what plugins receive", () => {
    expectTypeOf<InternalPluginInfoboxBlock>().toMatchTypeOf<PluginInfoboxBlock>();
    expectTypeOf<InternalPluginStoryBlock>().toMatchTypeOf<PluginStoryBlock>();
    expectTypeOf<InternalWidgetLayout>().toMatchTypeOf<WidgetLayout>();
  });
});
