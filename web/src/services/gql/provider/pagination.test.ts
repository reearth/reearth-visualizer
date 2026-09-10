import { describe, expect, it } from "vitest";

import { paginationMergeNodes } from "./pagination";

type Page = {
  nodes: unknown[];
  pageInfo: { startCursor: string; endCursor: string };
};

const page = (ids: string[]): Page => ({
  nodes: ids.map((id) => ({ id })),
  pageInfo: { startCursor: ids[0], endCursor: ids[ids.length - 1] }
});

const firstPage = { pagination: { first: 2 } };
const nextPage = (after: string) => ({ pagination: { first: 2, after } });

const merge = (
  existing: Page | null,
  incoming: Page,
  args: Record<string, unknown>
): Page => paginationMergeNodes(existing, incoming, { args } as never) as Page;

const ids = (result: Page) =>
  result.nodes.map((n) => (n as { id: string }).id);

describe("paginationMergeNodes", () => {
  it("appends when paging forward with an after cursor", () => {
    const loaded = merge(null, page(["a", "b"]), firstPage);
    const paged = merge(loaded, page(["c", "d"]), nextPage("b"));

    expect(ids(paged)).toEqual(["a", "b", "c", "d"]);
  });

  it("replaces the accumulated list when the first page is refetched", () => {
    // Open the Recycle Bin and scroll far enough to load a second page.
    const loaded = merge(null, page(["a", "b"]), firstPage);
    const paged = merge(loaded, page(["c", "d"]), nextPage("b"));

    // Another project is archived elsewhere, then the list is revalidated:
    // no `after` cursor, so this is page one again, not a third page.
    const revalidated = merge(paged, page(["z", "a"]), firstPage);

    expect(ids(revalidated)).toEqual(["z", "a"]);
  });

  it("carries the incoming pageInfo through both paths", () => {
    const loaded = merge(null, page(["a", "b"]), firstPage);
    const paged = merge(loaded, page(["c", "d"]), nextPage("b"));

    expect(paged.pageInfo).toEqual({ startCursor: "c", endCursor: "d" });
    expect(merge(paged, page(["z"]), firstPage).pageInfo).toEqual({
      startCursor: "z",
      endCursor: "z"
    });
  });
});
