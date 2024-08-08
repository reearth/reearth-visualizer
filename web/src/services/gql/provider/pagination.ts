import { ReadFieldFunction } from "@apollo/client/cache/core/types/common";
import { isEqual } from "lodash-es";

export function paginationMerge(
  existing: any,
  incoming: any,
  { readField }: { readField: ReadFieldFunction },
) {
  if (existing && incoming && isEqual(existing, incoming)) return incoming;

  const merged = existing ? existing.edges.slice(0) : [];

  let offset = offsetFromCursor(merged, incoming?.pageInfo.startCursor, readField);
  if (offset < 0) offset = merged.length;

  for (let i = 0; i < incoming?.edges?.length; ++i) {
    merged[offset + i] = incoming.edges[i];
  }

  return {
    ...incoming,
    edges: merged,
  };
}

function offsetFromCursor(items: any, cursor: string, readField: ReadFieldFunction) {
  if (items.length < 1) return -1;
  for (let i = 0; i < items.length; ++i) {
    if (readField("cursor", items[i]) === cursor) {
      return i;
    }
  }
  return -1;
}
