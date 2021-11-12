import React from "react";

import theme, { fonts, styled } from "@reearth/theme";
import { TypographySize } from "@reearth/theme/fonts";

export type Props<T> = {
  className?: string;
  headers?: (keyof T)[];
  items?: T[];
  bg?: string;
  borderColor?: string;
  textColor?: string;
  textSize?: TypographySize;
  layout?: "auto" | "fixed";
  textAlign?: "left" | "center" | "right";
  width?: string;
  columnWidth?: string;
  columnHeight?: string;
  scroll?: boolean;
  multiLine?: boolean;
};

export default function Table<T>({
  className,
  width,
  headers,
  items,
  bg,
  borderColor,
  textColor,
  textSize = "s",
  layout = "auto",
  textAlign = "left",
  columnWidth,
  columnHeight,
  scroll = true,
  multiLine = false,
}: Props<T>): JSX.Element | null {
  return (
    <StyledTable
      bg={bg}
      borderColor={borderColor}
      textColor={textColor}
      textSize={fonts.sizes[textSize]}
      layout={layout}
      className={className}
      textAlign={textAlign}
      multiLine={multiLine}
      width={width}
      columnWidth={columnWidth}
      columnHeight={columnHeight}
      scroll={scroll}>
      <thead>
        <tr>
          {headers?.map((h, i) => (
            <StyledTh key={i} width={columnWidth}>
              {h}
            </StyledTh>
          ))}
        </tr>
      </thead>
      <tbody>
        {items?.map((item, i) => {
          return (
            <tr key={i}>
              {headers?.map((h, i) => {
                return <StyledTd key={i}>{item[h]}</StyledTd>;
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
}

const StyledTable = styled.table<{
  bg?: string;
  borderColor?: string;
  textColor?: string;
  textSize?: number;
  layout?: "auto" | "fixed";
  textAlign?: "left" | "center" | "right";
  multiLine?: boolean;
  columnWidth?: string;
  columnHeight?: string;
  scroll?: boolean;
  width?: string;
}>`
  table-layout: ${({ layout }) => layout};
  text-align: ${({ textAlign }) => textAlign};
  white-space: ${({ multiLine }) => (multiLine ? "normal" : "nowrap")};
  background: ${({ bg, theme }) => (bg ? bg : theme.main.bg)};
  border-color: ${({ borderColor, theme }) => (borderColor ? borderColor : theme.main.lighterBg)};
  color: ${({ textColor }) => (textColor ? textColor : theme.main.text)};
  font-size: ${({ textSize }) => `${textSize}px`};
  width: ${({ width }) => (width ? width : "100%")};
  height: ${({ columnHeight }) => columnHeight};
  overflow: ${({ scroll }) => (scroll ? "scroll" : "hidden")};
  display: block;
`;

const StyledTh = styled.th<{ width?: string }>`
  padding: ${({ theme }) => theme.metrics.s}px;
  font-weight: ${fonts.weight.normal};
  width: ${({ width }) => width};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTd = styled.td`
  padding: ${({ theme }) => theme.metrics.s}px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
