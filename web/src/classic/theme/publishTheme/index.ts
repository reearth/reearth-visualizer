import { useMemo } from "react";

import type { PublishTheme, SceneThemeOptions } from "./types";
import { publishTheme } from "./utils";

export { default as publishColors } from "./colors";

export { mask } from "./utils";

export function usePublishTheme(sceneThemeOptions?: SceneThemeOptions): PublishTheme {
  return useMemo(() => publishTheme(sceneThemeOptions), [sceneThemeOptions]);
}
