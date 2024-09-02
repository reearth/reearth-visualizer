import "@emotion/react";

import { Theme as CustomTheme } from "./reearthTheme/types";

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
