import "@emotion/react";
import { Theme as ClassicTheme } from "@reearth/classic/theme/reearthTheme/types";

import { Theme as ReearthTheme } from "./reearthTheme/types";

type TempTheme = ReearthTheme & {
  classic: ClassicTheme;
};

declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends TempTheme {}
}
