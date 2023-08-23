// Component Props
export type Props = {
  name?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Params = {
  value?: string;
  onChange?: (value: string) => void;
};
