import { colors } from "@reearth/theme";

export type FieldProps<T> = {
  value?: T;
  onChange?: (value: T | null) => void;
  name?: string;
  description?: string;
  linkedFieldName?: string;
  linked?: boolean;
  group?: boolean;
  overridden?: boolean;
  disabled?: boolean;
};

export const textColor = ({
  disabled,
  linked,
  overridden,
}: {
  disabled?: boolean;
  linked?: boolean;
  overridden?: boolean;
}) =>
  overridden
    ? colors.functional.attention
    : linked
    ? colors.primary.main
    : disabled
    ? colors.outline.main
    : undefined;
