import { colors } from "@reearth/theme";

export type FieldProps<T> = {
  value?: T;
  onChange?: (value: T | null) => void;
  name?: string;
  description?: string;
  linked?: boolean;
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
  linked
    ? colors.primary.main
    : overridden
    ? colors.danger.main
    : disabled
    ? colors.outline.main
    : undefined;
