import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { AppearanceField, StyleSimpleValue } from "../types";

import Field from "./Field";

type Props = {
  field: AppearanceField;
  value: StyleSimpleValue;
  editMode?: boolean;
  valueOptions?: { value: string; label: string }[];
  onUpdate: (value: StyleSimpleValue) => void;
};

const ValueTab: FC<Props> = ({
  field,
  value,
  editMode,
  valueOptions,
  onUpdate
}) => {
  return (
    <Wrapper>
      <Field
        field={field}
        value={value}
        editMode={editMode}
        options={valueOptions}
        onUpdate={onUpdate}
      />
    </Wrapper>
  );
};

export default ValueTab;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  minHeight: 28
}));
