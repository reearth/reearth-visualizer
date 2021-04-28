import { useContext } from "react";
import { ThemeContext } from "@emotion/react";
import rawStyled from "@emotion/styled";
export { css, keyframes } from "@emotion/react";

import { Theme } from "./theme";

export const styled = rawStyled;
export const useTheme = () => useContext(ThemeContext) as Theme;
