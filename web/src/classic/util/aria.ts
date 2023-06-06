import { AriaAttributes } from "react";

export function ariaProps(props: unknown): AriaAttributes {
  if (typeof props !== "object" || !props) return {};
  return Object.fromEntries(
    Object.entries(props)
      .filter(([k]) => typeof k === "string" && k.startsWith("aria"))
      .map(([k, v]) => [k.replace(/^aria-?/, "").toLowerCase(), v])
      .filter(([k]) => typeof k === "string" && keys.has(k))
      .map(([k, v]) => [`aria-${k}`, v]),
  );
}

const keys = new Set([
  "activedescendant",
  "atomic",
  "autocomplete",
  "busy",
  "checked",
  "colcount",
  "colindex",
  "colspan",
  "controls",
  "current",
  "describedby",
  "details",
  "disabled",
  "dropeffect",
  "errormessage",
  "expanded",
  "flowto",
  "grabbed",
  "haspopup",
  "hidden",
  "invalid",
  "keyshortcuts",
  "label",
  "labelledby",
  "level",
  "live",
  "modal",
  "multiline",
  "multiselectable",
  "orientation",
  "owns",
  "placeholder",
  "posinset",
  "pressed",
  "readonly",
  "relevant",
  "required",
  "roledescription",
  "rowcount",
  "rowindex",
  "rowspan",
  "selected",
  "setsize",
  "sort",
  "valuemax",
  "valuemin",
  "valuenow",
  "valuetext",
]);
