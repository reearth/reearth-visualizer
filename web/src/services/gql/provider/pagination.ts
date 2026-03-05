import type { FieldFunctionOptions } from "@apollo/client/cache";
import { isEqual } from "lodash-es";

export function paginationMerge(
  existing: {
    edges: { cursor: string }[];
    pageInfo: { startCursor: string };
  } | null,
  incoming: { edges: { cursor: string }[]; pageInfo: { startCursor: string } },
  { readField }: Pick<FieldFunctionOptions, "readField">
) {
  if (existing && incoming && isEqual(existing, incoming)) return incoming;

  const merged = existing ? existing.edges.slice(0) : [];

  let offset = offsetFromCursor(
    merged,
    incoming?.pageInfo.startCursor,
    readField
  );
  if (offset < 0) offset = merged.length;

  for (let i = 0; i < incoming?.edges?.length; ++i) {
    merged[offset + i] = incoming.edges[i];
  }

  return {
    ...incoming,
    edges: merged
  };
}

function offsetFromCursor(
  items: { cursor: string }[],
  cursor: string,
  readField: FieldFunctionOptions["readField"]
) {
  if (items.length < 1) return -1;
  for (let i = 0; i < items.length; ++i) {
    if (readField("cursor", items[i]) === cursor) {
      return i;
    }
  }
  return -1;
}
