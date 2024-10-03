import {
  ColorInput,
  NumberInput,
  Selector
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

import { Typography } from "../../types";

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

const fonwWeightOptions = [
  { value: "lighter", label: "lighter" },
  { value: "normal", label: "normal" },
  { value: "bold", label: "bold" },
  { value: "bolder", label: "bolder" }
];

type Props = {
  value: Typography | undefined;
  onChange: (value: Typography | undefined) => void;
};

const TypographyInput: FC<Props> = ({ value, onChange }) => {
  const t = useT();
  return (
    <Wrapper>
      <PropertyItem title={t("font family")}>
        <Selector
          options={fontFamilyOptions}
          value={value?.fontFamily}
          onChange={(v) => onChange?.({ ...value, fontFamily: v as string })}
        />
      </PropertyItem>
      <PropertyItem title={t("font size")}>
        <NumberInput
          value={value?.fontSize}
          onChange={(v) => onChange?.({ ...value, fontSize: v })}
        />
      </PropertyItem>
      <PropertyItem title={t("font weight")}>
        <Selector
          options={fonwWeightOptions}
          value={value?.fontWeight}
          onChange={(v) =>
            onChange?.({
              ...value,
              fontWeight: v as "lighter" | "normal" | "bold" | "bolder"
            })
          }
        />
      </PropertyItem>
      <PropertyItem title={t("font color")}>
        <ColorInput
          value={value?.color as string}
          onChange={(v) => onChange?.({ ...value, color: v })}
        />
      </PropertyItem>
      <PropertyItem title={t("italic")}>
        <BooleanSelectorField
          value={value?.italic}
          onChange={(v) => onChange?.({ ...value, italic: v })}
        />
      </PropertyItem>
      <PropertyItem title={t("underline")}>
        <BooleanSelectorField
          value={value?.underline}
          onChange={(v) => onChange?.({ ...value, underline: v })}
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
