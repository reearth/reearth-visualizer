import { Entity, JulianDate } from "cesium";
import { expect, test } from "vitest";

import { attachTag } from "./common";

test("attachTag", () => {
  const entity = new Entity();
  const time = new JulianDate();

  expect(entity.properties?.hasProperty("tag_a")).toBe(undefined);

  attachTag(entity, "tag_a", "value_a");
  expect(entity.properties?.hasProperty("tag_a")).toBe(true);
  expect(entity.properties?.hasProperty("tag_b")).toBe(false);
  const result1 = entity.properties?.getValue(time);
  expect(result1["tag_a"]).toBe("value_a");

  attachTag(entity, "tag_b", "value_b");
  expect(entity.properties?.hasProperty("tag_b")).toBe(true);
  const result2 = entity.properties?.getValue(time);
  expect(result2["tag_b"]).toBe("value_b");

  attachTag(entity, "tag_a", "value_a2");
  expect(entity.properties?.hasProperty("tag_a")).toBe(true);
  const result3 = entity.properties?.getValue(time);
  expect(result3["tag_a"]).toBe("value_a2");

  attachTag(entity, "tag_a", undefined);
  expect(entity.properties?.hasProperty("tag_a")).toBe(false);
});
