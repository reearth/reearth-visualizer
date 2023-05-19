export type FieldProps<T> = {
  value?: T;
  onChange?: (value: T | undefined) => void;
  name?: string;
  description?: string;
  linkedFieldName?: string;
  linked?: boolean;
  group?: boolean;
  overridden?: boolean;
  disabled?: boolean;
};
