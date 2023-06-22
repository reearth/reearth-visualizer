import "@emotion/react";

import { TempTheme } from "./reearthTheme/types";

declare module "@emotion/react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends TempTheme {}
}
