import { Typography, typographyStyles } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import tinycolor from "tinycolor2";

export type MarkdownProps = {
  className?: string;
  children?: string;
  styles?: Typography;
  backgroundColor?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
};

const plugins = [gfm];

export const Markdown: FC<MarkdownProps> = ({
  className,
  styles,
  backgroundColor,
  children,
  onClick,
  onDoubleClick
}) => {
  const dark = useMemo(
    () => (backgroundColor ? isDark(backgroundColor) : false),
    [backgroundColor]
  );

  const LinkRenderer = ({
    href,
    children
  }: {
    href?: string;
    children?: ReactNode;
  }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );

  return (
    <Wrapper
      className={className ?? "markdown-body"}
      styles={styles}
      data-testid="markdown-wrapper"
      dark={dark}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <ReactMarkdown
        remarkPlugins={plugins}
        className={className}
        components={{ a: LinkRenderer }}
      >
        {children || ""}
      </ReactMarkdown>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ styles?: Typography; dark: boolean }>(
  ({ styles, dark }) => ({
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    ...typographyStyles(styles),
    ["h1"]: {
      borderBottom: "none"
    },
    ["h2"]: {
      borderBottom: "none"
    },
    ["code"]: {
      backgroundColor: dark
        ? "rgba(240, 246, 252, 0.15)"
        : "rgba(27, 31, 35, 0.05)"
    },
    [".highlight pre"]: {
      backgroundColor: dark
        ? "rgba(22, 27, 34, 0.1)"
        : "rgba(246, 248, 250, 0.1)"
    },
    ["pre"]: {
      backgroundColor: dark
        ? "rgba(22, 27, 34, 0.1)"
        : "rgba(246, 248, 250, 0.1)"
    },
    ["table tr"]: {
      backgroundColor: "inherit",
      borderTopColor: dark
        ? "rgba(39, 67, 75, 0.1)"
        : "rgba(198, 203, 209, 0.1)"
    },
    ["table tr:nth-of-type(2n)"]: {
      backgroundColor: dark
        ? "rgba(22, 27, 34, 0.1)"
        : "rgba(246, 248, 250, 0.1)"
    },
    ["table td"]: {
      borderColor: dark ? "rgba(59, 67, 75, 0.1)" : "rgba(223, 226, 229, 0.1)"
    },
    ["table th"]: {
      borderColor: dark ? "rgba(59, 67, 75, 0.1)" : "rgba(223, 226, 229, 0.1)"
    },
    ["blockquote"]: {
      color: dark ? "rgba(139, 148, 158, 0.6)" : "rgba(106, 115, 125, 0.6)",
      borderLeftColor: dark
        ? "rgba(59, 67, 75, 0.1)"
        : "rgba(223, 226, 229, 0.1)"
    },
    ["hr"]: {
      backgroundColor: dark
        ? "rgba(48, 54, 61, 0.1)"
        : "rgba(225, 228, 232, 0.1)"
    }
  })
);

const isDark = (hex: string): boolean => tinycolor(hex).isDark();
