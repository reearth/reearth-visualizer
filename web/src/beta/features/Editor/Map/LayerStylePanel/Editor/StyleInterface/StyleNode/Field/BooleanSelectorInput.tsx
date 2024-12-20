import { Selector } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

const booleanOptions = [
  { value: "true", label: "true" },
  { value: "false", label: "false" }
];

type Props = {
  value: boolean | string | undefined;
  onChange: (value: boolean | undefined) => void;
};

const BooleanSelectorInput: FC<Props> = ({ value, onChange }) => {
  return (
    <Selector
      value={
        value === true || value === "true"
          ? "true"
          : value === false || value === "false"
            ? "false"
            : ""
      }
      options={booleanOptions}
      onChange={(v) =>
        onChange(v === "true" ? true : v === "false" ? false : undefined)
      }
    />
  );
};

export default BooleanSelectorInput;
