import type { Camera } from "@reearth/beta/utils/value";

export type { Camera } from "@reearth/beta/utils/value";

export type RowType = { id: keyof Camera; value?: number; description?: string; suffix?: string }[];
