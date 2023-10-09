import { useMemo, useState } from "react";

// import { ValueTypes } from "@reearth/beta/utils/value";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import usePropertyValueUpdate from "../common/usePropertyValueUpdate";
import BlockWrapper from "../common/Wrapper";

import CameraEditor from "./Editor";

export type Props = BlockProps;

const CameraBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  console.log(block);

  const items = useMemo(
    () => getFieldValue(block?.property?.items ?? [], ""),
    [block?.property?.items],
  );
  console.log(items);

  // const [value, setValue] = useState([
  //   {
  //     title: "title",
  //     color: "#ff00ff",
  //     bgColor: "#ffaa00",
  //     cameraPosition: {
  //       lat: 0,
  //       lng: 0,
  //       height: 0,
  //       heading: 0,
  //       pitch: 0,
  //       roll: 0,
  //       fov: 0,
  //     },
  //   },
  //   {
  //     title: "title 2",
  //   },
  //   {
  //     title: "title 3",
  //   },
  //   {
  //     title: "title 4",
  //   },
  //   {
  //     title: "title 5",
  //   },
  //   {
  //     title: "title 5",
  //   },
  //   {
  //     title: "title 5",
  //   },
  //   {
  //     title: "title 5",
  //   },
  //   {
  //     title: "title 5",
  //   },
  // ]);

  const [value, setValue] = useState(items);

  const { handlePropertyValueUpdate, handleAddPropertyItem } = usePropertyValueUpdate();

  // TODO: handle update
  // const handleUpdate = useCallback(
  //   (text: string) => {
  //     const schemaGroup = block?.property?.items?.find(
  //       i => i.schemaGroup === "default",
  //     )?.schemaGroup;
  //     if (!block?.property?.id || !schemaGroup) return;
  //     console.log(text);
  //     // handlePropertyValueUpdate(schemaGroup, block?.property?.id, "text", "string")(text);
  //   },
  //   [block?.property?.id, block?.property?.items, handlePropertyValueUpdate],
  // );
  const handleUpdate = (index: number, fieldId: string, updatedValue: any) => {
    // setValue()
    const updatedIndex = value[index];
    updatedIndex[fieldId] = updatedValue;
    value.splice(index, 1, updatedIndex);
    handlePropertyValueUpdate("default", block?.property?.id);
    setValue([...value]);
  };

  const handleDeleteItem = (index: number) => {
    value.splice(index, 1);
    setValue([...value]);
  };

  const handleAddItem = () => {
    if (!block?.property?.id) return;
    handleAddPropertyItem(block.property.id, "default");
    // setValue([...value, { title: "New Camera" }]);
  };

  return (
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      settingsEnabled={false}
      {...props}>
      <CameraEditor
        items={value}
        onUpdate={handleUpdate}
        onDeleteItem={handleDeleteItem}
        onAddItem={handleAddItem}
      />
    </BlockWrapper>
  );
};

export default CameraBlock;
