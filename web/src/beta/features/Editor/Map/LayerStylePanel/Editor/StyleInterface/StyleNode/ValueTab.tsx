import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { AppearanceField, StyleSimpleValue } from "../types";

import Field from "./Field";

type Props = {
  field: AppearanceField;
  value: StyleSimpleValue;
  valueOptions?: { value: string; label: string }[];
  onUpdate: (value: StyleSimpleValue) => void;
};

const ValueTab: FC<Props> = ({ field, value, valueOptions, onUpdate }) => {
  return (
    <Wrapper>
      <Field
        field={field}
        value={value}
        options={valueOptions}
        onUpdate={onUpdate}
      />
    </Wrapper>
  );
};

export default ValueTab;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  minHeight: 28
}));
