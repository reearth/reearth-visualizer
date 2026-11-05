import type { SceneMode as InternalSceneMode } from "@reearth/app/types";
import type {
  PluginInfoboxBlock,
  PluginStoryBlock,
  ViewerProperty,
  WidgetLayout
} from "@reearth/visualizer-plugin-api";
import { describe, expectTypeOf, it } from "vitest";

import type { PluginInfoboxBlock as InternalPluginInfoboxBlock } from "../../../Infobox/types";
import type { PluginStoryBlock as InternalPluginStoryBlock } from "../../../StoryPanel/types";
import type { WidgetLayout as InternalWidgetLayout } from "../../../Widgets/types";

// The package inlines simplified copies of these types, so the compiler is the
// only thing keeping them in sync. These are type-level checks: they do not run
// at runtime, `yarn type` is what fails when a type drifts.
describe("plugin API types", () => {
  it("accepts the app's internal types for what plugins receive", () => {
    expectTypeOf<InternalPluginInfoboxBlock>().toExtend<PluginInfoboxBlock>();
    expectTypeOf<InternalPluginStoryBlock>().toExtend<PluginStoryBlock>();
    expectTypeOf<InternalWidgetLayout>().toExtend<WidgetLayout>();
  });

  it("accepts the app's scene mode in the viewer property", () => {
    type PackageSceneMode = NonNullable<
      NonNullable<ViewerProperty["scene"]>["mode"]
    >;
    expectTypeOf<InternalSceneMode>().toExtend<PackageSceneMode>();
  });

  it("fails the type check when a type is not compatible", () => {
    // If this line stops being an error, the checks above no longer guard anything.
    // @ts-expect-error `{ nope: 1 }` is not a WidgetLayout
    expectTypeOf<{ nope: 1 }>().toExtend<WidgetLayout>();
  });
});
