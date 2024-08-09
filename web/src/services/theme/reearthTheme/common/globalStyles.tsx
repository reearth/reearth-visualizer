import { Global } from "@emotion/react";
import "github-markdown-css/github-markdown.css";

import { css } from "@reearth/services/theme";

import { fontFamilies } from "./fonts";

export const styles = css`
  html,
  body,
  #root {
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin: 0;
    font-family: ${fontFamilies};
    background-color: #000;
    color: #fff;
  }

  h1,
  p,
  input {
    margin: 0;
    padding: 0;
    font-family: ${fontFamilies};
  }

  button {
    margin: 0;
    padding: 0;
    background: transparent;
    outline: none;
    border: none;
    cursor: pointer;
    font-family: ${fontFamilies};
  }

  textarea {
    font-family: ${fontFamilies};
  }

  /* Split Pane Styles */
  .Resizer {
    background: #000;
    opacity: 0.2;
    z-index: 1;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -moz-background-clip: padding;
    -webkit-background-clip: padding;
    background-clip: padding-box;
  }

  .Resizer:hover {
    -webkit-transition: all 2s ease;
    transition: all 2s ease;
  }

  .Resizer.horizontal {
    height: 11px;
    margin: -5px 0;
    border-top: 5px solid rgba(255, 255, 255, 0);
    border-bottom: 5px solid rgba(255, 255, 255, 0);
    cursor: row-resize;
    width: 100%;
  }

  .Resizer.horizontal:hover {
    border-top: 5px solid rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(0, 0, 0, 0.5);
  }

  .Resizer.vertical {
    width: 11px;
    margin: 0 -5px;
    border-left: 5px solid rgba(255, 255, 255, 0);
    border-right: 5px solid rgba(255, 255, 255, 0);
    cursor: col-resize;
  }

  .Resizer.vertical:hover {
    border-left: 5px solid rgba(0, 0, 0, 0.5);
    border-right: 5px solid rgba(0, 0, 0, 0.5);
  }

  .Resizer.disabled {
    cursor: not-allowed;
  }

  .Resizer.disabled:hover {
    border-color: transparent;
  }

  *:focus {
    outline: none;
  }

  /* For Firefox */
  body {
    scrollbar-width: thin;
  }
`;

const GlobalStyles: React.FC = () => <Global styles={styles} />;

export default GlobalStyles;
