import { IMAGE_TYPES } from "@reearth/app/features/AssetsManager/constants";
import {
  ColorInput,
  NumberInput,
  Selector,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import { AssetField } from "@reearth/app/ui/fields";
import { FC } from "react";

import { AppearanceField, StyleSimpleValue, Typography } from "../../types";

import BooleanSelectorInput from "./BooleanSelectorInput";
import TypographyInput from "./TypographyInput";

type FieldProps = {
  field?: AppearanceField;
  value: StyleSimpleValue;
  editMode?: boolean;
  options?: { value: string; label: string }[];
  onUpdate: (value: StyleSimpleValue) => void;
};

const fieldComponents = {
  switch: (props: FieldProps) => (
    <BooleanSelectorInput
      value={props.value as boolean}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
      onChange={props.onUpdate}
    />
  ),
  number: (props: FieldProps) => (
    <NumberInput
      value={props.value as number}
      onBlur={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  ),
  text: (props: FieldProps) => (
    <TextInput
      value={props.value as string}
      onBlur={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  ),
  color: (props: FieldProps) => (
    <ColorInput
      value={props.value as string}
      onChange={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  ),
  select: (props: FieldProps) =>
    props.options ? (
      <Selector
        value={props.value as string}
        options={props.options}
        onChange={(v) => props.onUpdate(v as string)}
        disabled={!props.editMode}
        appearance={!props.editMode ? "readonly" : undefined}
      />
    ) : null,
  typography: (props: FieldProps) => (
    <TypographyInput
      value={props.value as Typography}
      onChange={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  ),
  image: (props: FieldProps) => (
    <AssetField
      inputMethod="asset"
      value={props.value as string}
      assetsTypes={IMAGE_TYPES}
      onChange={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  ),
  model: (props: FieldProps) => (
    <AssetField
      inputMethod="asset"
      value={props.value as string}
      assetsTypes={["model"]}
      onChange={props.onUpdate}
      disabled={!props.editMode}
      appearance={!props.editMode ? "readonly" : undefined}
    />
  )
};

const Field: FC<FieldProps> = (props) => {
  if (!props.field) return null;
  const FieldComponent = fieldComponents[props.field];
  return FieldComponent ? <FieldComponent {...props} /> : null;
};

export default Field;
