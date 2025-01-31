import { FC, useState } from "react";

import { InputField, NumberField, SwitchField } from "../../../ui/fields";

type Props = {
  field: {
    id: string;
    type: string;
    title: string;
    name?: string;
  };
};

const PropertyItem: FC<Props> = ({ field }) => {
  const [value, setValue] = useState<string | number | boolean>(() => {
    switch (field.type) {
      case "number":
        return 0;
      case "bool":
        return false;
      default:
        return "";
    }
  });

  const handleChange = (newValue?: string | number | boolean) => {
    switch (typeof newValue) {
      case "string":
        setValue(newValue);
        break;
      case "number":
        if (!isNaN(newValue)) {
          setValue(newValue);
        }
        break;
      case "boolean":
        setValue(newValue);
        break;
      default:
        console.warn(`Unsupported value type: ${typeof newValue}`);
    }
  };

  return (
    <>
      {field.type === "number" ? (
        <NumberField
          key={field.id}
          title={field.name}
          value={value as number}
          onChange={handleChange}
        />
      ) : field.type === "bool" ? (
        <SwitchField
          key={field.id}
          title={field.name}
          value={value as boolean}
          onChange={handleChange}
        />
      ) : (
        <InputField
          key={field.id}
          title={field.name}
          value={value as string}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default PropertyItem;
