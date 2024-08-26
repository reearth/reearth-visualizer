import "@emotion/react";

import { Theme as CustomTheme } from "./reearthTheme/types";

declare module "@emotion/react" {
   
  export type Theme = {} & CustomTheme
}
