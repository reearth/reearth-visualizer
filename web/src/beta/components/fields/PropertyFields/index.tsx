import TextInput from "@reearth/beta/components/fields/TextInput";
import { type Item } from "@reearth/services/api/propertyApi/utils";

import ColorField from "../ColorField";
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

        switch (sf.type) {
          case "string":
            // TODO: Can also be turned into a switch and infact bunch of props are common
            return sf.ui === "color" ? (
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
            );
          case "bool":
            return (
              <ToggleField
                key={sf.id}
                name={sf.name}
                checked={value as boolean}
                description={sf.description}
                onChange={handlePropertyValueUpdate(item.schemaGroup, propertyId, sf.id, sf.type)}
              />
            );

          default:
            return <p key={sf.id}>{sf.name} field</p>;
        }
      })}
    </>
  );
};

export default PropertyFields;
