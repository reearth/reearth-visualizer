import { useCallback, useState } from "react";

import ColorField from "@reearth/beta/components/fields/ColorField";
import ListField from "@reearth/beta/components/fields/ListField";
import LocationField from "@reearth/beta/components/fields/LocationField";
import NumberField from "@reearth/beta/components/fields/NumberField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import SliderField from "@reearth/beta/components/fields/SliderField";
import SpacingInput, { SpacingValues } from "@reearth/beta/components/fields/SpacingInput";
import TextInput from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import { type LatLng } from "@reearth/beta/utils/value";
import { type Item } from "@reearth/services/api/propertyApi/utils";

import CameraField, { CameraValue } from "../CameraField";

import useHooks from "./hooks";

type Props = {
  propertyId: string;
  item?: Item;
};

const PropertyFields: React.FC<Props> = ({ propertyId, item }) => {
  const { handlePropertyValueUpdate } = useHooks();

  // Just for the ListItem Property
  const isList = item && "items" in item;
  const [listItems, setListItems] = useState<Array<{ id: string; value: string }>>([]);

  const addItem = useCallback(() => {
    if (!isList) return;
    // TODO: Won't be a random string. Need fields
    const randomId = (Math.random() + 1).toString(36).substring(7);
    setListItems([
      ...listItems,
      {
        id: randomId,
        value: `Item ${randomId}`,
      },
    ]);
  }, [isList, listItems, setListItems]);

  const removeItem = useCallback(
    (key: string) => {
      if (!isList) return;
      setListItems(listItems.filter(({ id }) => id != key));
    },
    [isList, listItems, setListItems],
  );

  const onItemDrop = useCallback(
    (item: { id: string; value: string }, index: number) => {
      if (!isList) return;
      const items = [...listItems];
      items.splice(
        items.findIndex(x => x.id === item.id),
        1,
      );
      items.splice(index, 0, item);
      setListItems(listItems);
    },
    [isList, listItems, setListItems],
  );

  return (
    <>
      {isList && (
        <ListField
          name={item.title}
          items={listItems}
          addItem={addItem}
          removeItem={removeItem}
          onItemDrop={onItemDrop}
        />
      )}
      {item?.schemaFields.map(sf => {
        const isList = item && "items" in item;
        const value = !isList ? item.fields.find(f => f.id === sf.id)?.value : sf.defaultValue;

        const handleChange = handlePropertyValueUpdate(
          item.schemaGroup,
          propertyId,
          sf.id,
          sf.type,
        );

        return sf.type === "string" ? (
          sf.ui === "color" ? (
            <ColorField
              key={sf.id}
              name={sf.name}
              value={(value as string) ?? ""}
              description={sf.description}
              onChange={handleChange}
            />
          ) : sf.ui === "selection" || sf.choices ? (
            <SelectField
              key={sf.id}
              name={sf.name}
              value={(value as string) ?? ""}
              description={sf.description}
              options={sf.choices}
              onChange={handleChange}
            />
          ) : sf.ui === "buttons" ? (
            <p key={sf.id}>Button radio field</p>
          ) : (
            <TextInput
              key={sf.id}
              name={sf.name}
              value={(value as string) ?? ""}
              description={sf.description}
              onChange={handleChange}
            />
          )
        ) : sf.type === "spacing" ? (
          <SpacingInput
            key={sf.id}
            name={sf.name}
            value={(value as SpacingValues) ?? ""}
            description={sf.description}
            min={sf.min}
            max={sf.max}
            onChange={handleChange}
          />
        ) : sf.type === "bool" ? (
          <ToggleField
            key={sf.id}
            name={sf.name}
            checked={value as boolean}
            description={sf.description}
            onChange={handleChange}
          />
        ) : sf.type === "number" ? (
          sf.ui === "slider" ? (
            <SliderField
              key={sf.id}
              name={sf.name}
              value={value as number}
              min={sf.min}
              max={sf.max}
              description={sf.description}
              onChange={handleChange}
            />
          ) : (
            <NumberField
              key={sf.id}
              name={sf.name}
              value={value as number}
              suffix={sf.suffix}
              min={sf.min}
              max={sf.max}
              description={sf.description}
              onChange={handleChange}
            />
          )
        ) : sf.type === "latlng" ? (
          <LocationField
            key={sf.id}
            name={sf.name}
            value={value as LatLng}
            description={sf.description}
            onChange={handleChange}
          />
        ) : sf.type === "camera" ? (
          <CameraField
            key={sf.id}
            name={sf.name}
            value={value as CameraValue}
            description={sf.description}
            onChange={handleChange}
          />
        ) : (
          <p key={sf.id}>{sf.name} field</p>
        );
      })}
    </>
  );
};

export default PropertyFields;
