import { ColorInput, NumberInput, Selector } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

import { FontWeight, Typography } from "../../types";

import BooleanSelectorField from "./BooleanSelectorInput";

const fontFamilyOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Courier New", label: "Courier New" },
  { value: "Georgia", label: "Georgia" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Verdana", label: "Verdana" },
  { value: "YuGothic", label: "游ゴシック" }
];
const fontWeightOptions = [
  { value: "100", label: "Thin (100)" },
  { value: "200", label: "Extra Light (200)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
  { value: "900", label: "Black (900)" }
];

type Props = {
  value: Typography | undefined;
  disabled?: boolean;
  appearance?: "readonly";
  onChange: (value: Typography | undefined) => void;
};

const TypographyInput: FC<Props> = ({
  value,
  disabled,
  appearance,
  onChange
}) => {
  const t = useT();
  return (
    <Wrapper>
      <PropertyItem title={t("font family")}>
        <Selector
          options={fontFamilyOptions}
          value={value?.fontFamily}
          onChange={(v) => onChange?.({ ...value, fontFamily: v as string })}
          disabled={disabled}
          appearance={appearance}
        />
      </PropertyItem>
      <PropertyItem title={t("font size")}>
        <NumberInput
          value={value?.fontSize}
          disabled={disabled}
          appearance={appearance}
          onChange={(v) => onChange?.({ ...value, fontSize: v })}
        />
      </PropertyItem>
      <PropertyItem title={t("font weight")}>
        <Selector
          options={fontWeightOptions}
          value={value?.fontWeight}
          disabled={disabled}
          appearance={appearance}
          onChange={(v) =>
            onChange?.({
              ...value,
              fontWeight: v as FontWeight
            })
          }
        />
      </PropertyItem>
      <PropertyItem title={t("font color")}>
        <ColorInput
          value={value?.color as string}
          disabled={disabled}
          appearance={appearance}
          onChange={(v) => onChange?.({ ...value, color: v })}
        />
      </PropertyItem>
      <PropertyItem title={t("italic")}>
        <BooleanSelectorField
          value={value?.italic}
          disabled={disabled}
          appearance={appearance}
          onChange={(v) => onChange?.({ ...value, italic: v })}
        />
      </PropertyItem>
    </Wrapper>
  );
};

export default TypographyInput;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  width: "100%"
}));

const PropertyItem: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children
}) => {
  return (
    <PropertyItemWrapper>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </PropertyItemWrapper>
  );
};

const PropertyItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  width: "100%",
  alignItems: "center"
}));

const Title = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "50%",
  flexGrow: 0
}));

const Content = styled("div")(() => ({
  width: "50%",
  flexGrow: 0
}));
