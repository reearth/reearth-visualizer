import { ThemeContext } from "@emotion/react";
import rawStyled from "@emotion/styled";
import { useContext } from "react";

import { Theme } from "./theme";

export { css, keyframes } from "@emotion/react";

export const styled = rawStyled;
export const useTheme = () => useContext(ThemeContext) as Theme;
