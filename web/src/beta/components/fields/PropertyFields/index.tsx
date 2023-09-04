import TextInput from "@reearth/beta/components/fields/TextInput";
import { type Item } from "@reearth/services/api/propertyApi/utils";

import ColorField from "../ColorField";
import SliderField from "../SliderField";
import ToggleField from "../ToggleField";

import useHooks from "./hooks";

type Props = {
  propertyId: string;
  item?: Item;
};

const PropertyFields: React.FC<Props> = ({ propertyId, item }) => {
  const { handlePropertyValueUpdate } = useHooks();

  return (
    <>
      {item?.schemaFields.map(sf => {
        const isList = item && "items" in item;
        const value = !isList ? item.fields.find(f => f.id === sf.id)?.value : sf.defaultValue;
        const min = sf?.min;
        const max = sf?.max;

        return sf.type === "string" ? (
          sf.ui === "color" ? (
            <ColorField
              key={sf.id}
              name={sf.name}
              value={(value as string) ?? ""}
              description={sf.description}
              onChange={handlePropertyValueUpdate(item.schemaGroup, propertyId, sf.id, sf.type)}
            />
          ) : sf.ui === "selection" || sf.choices ? (
            <p key={sf.id}>Selection or choices field</p>
          ) : sf.ui === "buttons" ? (
            <p key={sf.id}>Button radio field</p>
          ) : (
            <TextInput
              key={sf.id}
              name={sf.name}
              value={(value as string) ?? ""}
              description={sf.description}
              onChange={handlePropertyValueUpdate(item.schemaGroup, propertyId, sf.id, sf.type)}
            />
          )
        ) : sf.type == "bool" ? (
          <ToggleField
            key={sf.id}
            name={sf.name}
            checked={value as boolean}
            description={sf.description}
            onChange={handlePropertyValueUpdate(item.schemaGroup, propertyId, sf.id, sf.type)}
          />
        ) : sf.type == "number" ? (
          <SliderField
            key={sf.id}
            name={sf.name}
            value={value as number}
            min={min as number}
            max={max as number}
            description={sf.description}
            onChange={handlePropertyValueUpdate(item.schemaGroup, propertyId, sf.id, sf.type)}
          />
        ) : (
          <p key={sf.id}>{sf.name} field</p>
        );
      })}
    </>
  );
};

export default PropertyFields;
