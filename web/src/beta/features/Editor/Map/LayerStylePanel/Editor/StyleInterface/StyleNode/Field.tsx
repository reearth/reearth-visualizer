import {
  ColorInput,
  NumberInput,
  Selector,
  Switcher,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import { AppearanceField, StyleSimpleValue } from "../types";

type Props = {
  field: AppearanceField;
  value: StyleSimpleValue;
  options?: { value: string; label: string }[];
  onUpdate: (value: StyleSimpleValue) => void;
};

const fieldComponents = {
  switch: (props: Props) => (
    <Switcher value={props.value as boolean} onChange={props.onUpdate} />
  ),
  number: (props: Props) => (
    <NumberInput value={props.value as number} onChange={props.onUpdate} />
  ),
  text: (props: Props) => (
    <TextInput value={props.value as string} onChange={props.onUpdate} />
  ),
  color: (props: Props) => (
    <ColorInput value={props.value as string} onChange={props.onUpdate} />
  ),
  select: (props: Props) =>
    props.options ? (
      <Selector
        value={props.value as string}
        options={props.options}
        onChange={(v) => props.onUpdate(v as string)}
      />
    ) : null
};

const Field: FC<Props> = (props) => {
  const FieldComponent = fieldComponents[props.field];
  return FieldComponent ? <FieldComponent {...props} /> : null;
};

export default Field;
