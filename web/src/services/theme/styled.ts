import { ThemeContext } from "@emotion/react";
import rawStyled from "@emotion/styled";
import { useContext } from "react";

import { TempTheme } from "./reearthTheme/types";

export { css, keyframes } from "@emotion/react";

export const styled = rawStyled;
// export const useTheme = () => useContext(ThemeContext) as Theme;
export const useTheme = () => useContext(ThemeContext) as TempTheme;
