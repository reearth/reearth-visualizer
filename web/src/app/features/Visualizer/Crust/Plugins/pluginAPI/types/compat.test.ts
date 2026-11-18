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

// The package inlines copies of these types, so the compiler is the only thing
// keeping them in sync. These are type-level checks: they do not run at
// runtime, `yarn type` is what fails when a type drifts.
//
// The types must be equal, not only assignable one way. Most fields are
// optional, so a field removed from one side would still be assignable, and
// plugins would see a field that the app never sends.
describe("plugin API types", () => {
  it("keeps the app's internal types equal to what plugins see", () => {
    expectTypeOf<InternalPluginInfoboxBlock>().toEqualTypeOf<PluginInfoboxBlock>();
    expectTypeOf<InternalPluginStoryBlock>().toEqualTypeOf<PluginStoryBlock>();
    expectTypeOf<InternalWidgetLayout>().toEqualTypeOf<WidgetLayout>();
  });

  it("keeps the app's scene mode equal to the viewer property's", () => {
    type PackageSceneMode = NonNullable<
      NonNullable<ViewerProperty["scene"]>["mode"]
    >;
    expectTypeOf<InternalSceneMode>().toEqualTypeOf<PackageSceneMode>();
  });

  it("fails the type check when a type drifts", () => {
    // If these lines stop being errors, the checks above no longer guard anything.
    // @ts-expect-error `{ nope: 1 }` is not a WidgetLayout
    expectTypeOf<{ nope: 1 }>().toEqualTypeOf<WidgetLayout>();
    // An optional field that is missing on one side must be caught.
    // @ts-expect-error `align` is missing
    expectTypeOf<Omit<InternalWidgetLayout, "align">>().toEqualTypeOf<WidgetLayout>();
  });
});
