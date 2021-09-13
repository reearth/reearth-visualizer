import { difference } from "lodash-es";
import React, { useMemo, useCallback } from "react";

import { styled, useTheme } from "@reearth/theme";
import { Typography } from "@reearth/util/value";

import ColorField from "../ColorField";
import RadioField from "../RadioField";
import { FieldProps } from "../types";

import FontFamilyField, { SafeFontFamilies } from "./FontFamilyField";
import FontFormatField, { FontFormatKey } from "./FontFormatField";
import FontSizeField, { FontSize } from "./FontSizeField";

type Props = FieldProps<Typography> & {
  className?: string;
};

const horizontalAlignItems = [
  { key: "left", label: "left", icon: "alignLeft" } as const,
  { key: "center", label: "center", icon: "alignCenter" } as const,
  { key: "right", label: "right", icon: "alignRight" } as const,
  { key: "justify", label: "justify", icon: "alignJustify" } as const,
];

type HorizontalAlignKey = typeof horizontalAlignItems[number]["label"];

// const verticalAlignItems = [
//   { key: "top", label: "top", icon: "verticalAlignTop" },
//   { key: "center", label: "center", icon: "verticalAlignCenter" },
//   { key: "bottom", label: "bottom", icon: "verticalAlignBottom" },
// ];

const TypographyField: React.FC<Props> = ({
  className,
  value,
  onChange,
  linked,
  overridden,
  disabled,
}) => {
  const { fontFamily, fontSize, color, textAlign, bold, italic, underline } = value ?? {};
  const theme = useTheme();
  const tColor = overridden ? theme.main.warning : linked ? theme.main.link : undefined;

  const updateTypography = useCallback(
    (typography: Partial<Typography>) => onChange?.({ ...(value ?? {}), ...typography }),
    [onChange, value],
  );

  const handleChangeFamily = useCallback(
    (value: string) => updateTypography({ fontFamily: value }),
    [updateTypography],
  );

  const handleChangeSize = useCallback(
    (value: FontSize) => updateTypography({ fontSize: value }),
    [updateTypography],
  );

  const handleChangeColor = useCallback(
    (hex: string | null) => updateTypography({ color: hex ?? undefined }),
    [updateTypography],
  );

  const handleChangeAlign = useCallback(
    (value: string | null) =>
      updateTypography({ textAlign: (value ?? undefined) as HorizontalAlignKey | undefined }),
    [updateTypography],
  );

  const fontFormatValues = useMemo(
    () =>
      [bold && "bold", italic && "italic", underline && "underline"].filter(
        Boolean,
      ) as FontFormatKey[],
    [bold, italic, underline],
  );

  const handleChangeFormat = useCallback(
    (values: FontFormatKey[]) => {
      return updateTypography(
        Object.fromEntries(
          values
            .map(value => [value, true])
            .concat(difference(fontFormatValues, values).map(value => [value, false])),
        ) as Record<FontFormatKey, boolean>,
      );
    },
    [updateTypography, fontFormatValues],
  );

  return (
    <Wrapper className={className}>
      <Row>
        <FontFamilyField
          value={fontFamily as SafeFontFamilies}
          color={tColor}
          onChange={handleChangeFamily}
        />
      </Row>
      <Row>
        <FontSizeField value={fontSize as FontSize} color={tColor} onChange={handleChangeSize} />
      </Row>
      <Row>
        <ColorField disabled={disabled} value={color} onChange={handleChangeColor} />
      </Row>
      <FontHorizontalAlignField
        value={textAlign}
        items={horizontalAlignItems}
        onChange={handleChangeAlign}
      />
      {/* <FontVerticalAlignField
        value={textAlign}
        items={verticalAlignItems}
        onChange={handleChangeVerticalAlign}
      /> */}
      <FontFormatField values={fontFormatValues} onChange={handleChangeFormat} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const Row = styled.div`
  margin-bottom: 8px;
`;

const FontHorizontalAlignField = styled(RadioField)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

// const FontVerticalAlignField = styled(RadioField)`
//   margin-right: 8px;
//   margin-bottom: 8px;
// `;

export default TypographyField;
