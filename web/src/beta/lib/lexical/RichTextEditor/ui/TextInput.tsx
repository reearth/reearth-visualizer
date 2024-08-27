import "./Input.css";

import { HTMLInputTypeAttribute } from "react";

type Props = Readonly<{
  "data-test-id"?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: HTMLInputTypeAttribute;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}: Props): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
        type={type}
        className="Input__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-test-id={dataTestId}
      />
    </div>
  );
}
