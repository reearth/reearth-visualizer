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

const Field: FC<Props> = ({ field, value, options, onUpdate }) => {
  return field === "switch" ? (
    <Switcher value={value as boolean} onChange={onUpdate} />
  ) : field === "number" ? (
    <NumberInput value={value as number} onChange={onUpdate} />
  ) : field === "text" ? (
    <TextInput value={value as string} onChange={onUpdate} />
  ) : field === "color" ? (
    <ColorInput value={value as string} onChange={onUpdate} />
  ) : field === "select" && options ? (
    <Selector
      value={value as string}
      options={options}
      onChange={(v) => onUpdate(v as string)}
    />
  ) : null;
};

export default Field;
