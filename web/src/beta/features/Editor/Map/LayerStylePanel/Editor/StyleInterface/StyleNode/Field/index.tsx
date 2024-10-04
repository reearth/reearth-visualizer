import {
  ColorInput,
  NumberInput,
  Selector,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import { AppearanceField, StyleSimpleValue, Typography } from "../../types";

import BooleanSelectorInput from "./BooleanSelectorInput";
import TypographyInput from "./TypographyInput";

type FieldProps = {
  field?: AppearanceField;
  value: StyleSimpleValue;
  options?: { value: string; label: string }[];
  onUpdate: (value: StyleSimpleValue) => void;
};

const fieldComponents = {
  switch: (props: FieldProps) => (
    <BooleanSelectorInput
      value={props.value as boolean}
      onChange={props.onUpdate}
    />
  ),
  number: (props: FieldProps) => (
    <NumberInput value={props.value as number} onChange={props.onUpdate} />
  ),
  text: (props: FieldProps) => (
    <TextInput value={props.value as string} onChange={props.onUpdate} />
  ),
  color: (props: FieldProps) => (
    <ColorInput value={props.value as string} onChange={props.onUpdate} />
  ),
  select: (props: FieldProps) =>
    props.options ? (
      <Selector
        value={props.value as string}
        options={props.options}
        onChange={(v) => props.onUpdate(v as string)}
      />
    ) : null,
  typography: (props: FieldProps) => (
    <TypographyInput
      value={props.value as Typography}
      onChange={props.onUpdate}
    />
  )
};

const Field: FC<FieldProps> = (props) => {
  if (!props.field) return null;
  const FieldComponent = fieldComponents[props.field];
  return FieldComponent ? <FieldComponent {...props} /> : null;
};

export default Field;
