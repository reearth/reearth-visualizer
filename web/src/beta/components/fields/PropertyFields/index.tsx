import { useState, useMemo } from "react";

import CameraField from "@reearth/beta/components/fields/CameraField";
import ColorField from "@reearth/beta/components/fields/ColorField";
import ListField from "@reearth/beta/components/fields/ListField";
import LocationField from "@reearth/beta/components/fields/LocationField";
import NumberField from "@reearth/beta/components/fields/NumberField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import SliderField from "@reearth/beta/components/fields/SliderField";
import SpacingInput, { type SpacingValues } from "@reearth/beta/components/fields/SpacingInput";
import TextInput from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera, LatLng } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";

import useHooks from "./hooks";

type Props = {
  propertyId: string;
  item: Item;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const PropertyFields: React.FC<Props> = ({ propertyId, item, currentCamera, onFlyTo }) => {
  const {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
    handleRemovePropertyItem,
    handleMovePropertyItem,
  } = useHooks(propertyId, item.schemaGroup);

  // Just for the ListItem Property
  const isList = item && "items" in item;

  // TODO: Only applies to list, should be refactored
  const [selected, setSelected] = useState<string | undefined>();

  // TODO: Only applies to list, should be refactored
  const propertyListItems: Array<{ id: string; value: string }> = useMemo(
    () =>
      isList
        ? item.items
            .filter(i => "id" in i)
            .map(i => {
              const representativeField = item?.representativeField
                ? i.fields.find(f => f.id === item.representativeField)
                : undefined;
              const nameSchemaField = item?.schemaFields?.find(
                sf => sf.id === item.representativeField,
              );

              const value = representativeField?.value || nameSchemaField?.defaultValue;

              const choice = nameSchemaField?.choices
                ? nameSchemaField?.choices?.find(c => c.key === value)?.label
                : undefined;

              const title = choice || value;

              return {
                id: i.id,
                value: title as string,
              };
            })
        : [],
    [isList, item],
  );

  const showFields = useMemo(() => {
    return isList ? (selected ? item.items.find(({ id }) => id == selected) : false) : true;
  }, [item, selected, isList]);

  return (
    <>
      {isList && (
        <ListField
          name={item.title}
          items={propertyListItems}
          addItem={handleAddPropertyItem}
          removeItem={handleRemovePropertyItem}
          onItemDrop={handleMovePropertyItem}
          selected={selected}
          onSelect={setSelected}
        />
      )}
      {showFields &&
        item?.schemaFields.map(sf => {
          const value = isList
            ? item.items.find(({ id }) => selected == id)?.fields.find(f => f.id == sf.id)?.value
            : item.fields.find(f => f.id === sf.id)?.value;

          const handleChange = handlePropertyValueUpdate(sf.id, sf.type, selected);

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
              checked={!!value}
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
                value={(value as number) ?? undefined}
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
              value={value as Camera}
              description={sf.description}
              currentCamera={currentCamera}
              onSave={handleChange}
              onFlyTo={onFlyTo}
            />
          ) : (
            <p key={sf.id}>{sf.name} field</p>
          );
        })}
    </>
  );
};

export default PropertyFields;
