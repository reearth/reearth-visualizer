import type { Camera } from "@reearth/beta/utils/value";

export type { Camera } from "@reearth/beta/utils/value";

export type RowType = { id: keyof Camera; description?: string; suffix?: string }[];
