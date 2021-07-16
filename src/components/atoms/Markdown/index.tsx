import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import tinycolor from "tinycolor2";

import { styled } from "@reearth/theme";
import { Typography, typographyStyles } from "@reearth/util/value";

export type Props = {
  className?: string;
  children?: string;
  styles?: Typography;
  backgroundColor?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
};

const plugins = [gfm];

const Markdown: React.FC<Props> = ({
  className,
  styles,
  backgroundColor,
  children,
  onClick,
  onDoubleClick,
}) => {
  const dark = useMemo(
    () => (backgroundColor ? isDark(backgroundColor) : false),
    [backgroundColor],
  );

  return (
    <Wrapper
      className="markdown-body" // github-markdown-css is imported at src/theme/globalstyle.tsx
      styles={styles}
      dark={dark}
      onClick={onClick}
      onDoubleClick={onDoubleClick}>
      <ReactMarkdown
        source={children || ""}
        plugins={plugins}
        className={className}
        linkTarget="_blank"
      />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ styles?: Typography; dark: boolean }>`
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  ${({ styles }) => typographyStyles(styles)}

  h1,
  h2 {
    border-bottom: none;
  }

  code {
    background-color: ${({ dark }) =>
      dark ? "rgba(240, 246, 252, 0.15)" : "rgba(27, 31, 35, 0.05)"};
  }

  .highlight pre,
  pre {
    background-color: ${({ dark }) =>
      color(dark ? "#161b22" : "#f6f8fa", 0.1, dark)}; // #161b22 #f6f8fa
  }

  table tr {
    background-color: inherit;
    border-top-color: ${({ dark }) => color(dark ? "#272c32" : "#c6cbd1", 0.1, dark)};
  }

  table tr:nth-of-type(2n) {
    background-color: ${({ dark }) => color(dark ? "#161b22" : "#f6f8fa", 0.1, dark)};
  }

  table td,
  table th {
    border-color: ${({ dark }) => color(dark ? "#3b434b" : "#dfe2e5", 0.1, dark)};
  }

  blockquote {
    color: inherit; /* #8b949e #6a737d */
    border-left-color: ${({ dark }) => color(dark ? "#3b434b" : "#dfe2e5", 0.1, dark)};
  }

  hr {
    background-color: ${({ dark }) => color(dark ? "#30363d" : "#e1e4e8", 0.1, dark)};
  }
`;

const color = (hex: string, alpha: number, dark: boolean) => {
  const color = tinycolor(hex).toRgb();
  const bg = dark ? 0 : 255;

  // out = a * alpha + b * (1 - alpha)
  // a = (out - b * (1 - alpha)) / alpha
  const nr = Math.floor((color.r - (1 - alpha) * bg) / alpha);
  const ng = Math.floor((color.g - (1 - alpha) * bg) / alpha);
  const nb = Math.floor((color.b - (1 - alpha) * bg) / alpha);

  return `rgba(${nr}, ${ng}, ${nb}, ${alpha})`;
};

const isDark = (hex: string): boolean => tinycolor(hex).isDark();

export default Markdown;
