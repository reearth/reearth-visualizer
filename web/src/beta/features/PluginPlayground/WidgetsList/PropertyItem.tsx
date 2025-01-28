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
  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [booleanValue, setBooleanValue] = useState(false);

  const handleChange = (newValue?: string | number | boolean) => {
    switch (typeof newValue) {
      case "string":
        setTextValue(newValue);
        break;
      case "number":
        setNumberValue(newValue);
        break;
      case "boolean":
        setBooleanValue(newValue);
    }
  };

  return (
    <>
      {field.type === "number" ? (
        <NumberField
          key={field.id}
          title={field.name}
          value={numberValue}
          onChange={handleChange}
        />
      ) : field.type === "bool" ? (
        <SwitchField
          key={field.id}
          title={field.name}
          value={booleanValue}
          onChange={handleChange}
        />
      ) : (
        <InputField
          key={field.id}
          title={field.name}
          value={textValue}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default PropertyItem;
