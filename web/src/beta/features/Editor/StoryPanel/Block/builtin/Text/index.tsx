import { useCallback, useMemo } from "react";

import RichTextEditor from "@reearth/beta/lib/lexical/RichTextEditor";
import { ValueTypes } from "@reearth/beta/utils/value";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import usePropertyValueUpdate from "../common/usePropertyValueUpdate";
import BlockWrapper from "../common/Wrapper";

export type Props = BlockProps;

const TextBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "text") as ValueTypes["string"],
    [block?.property?.items],
  );

  // Text block is very special, it will not edit values with field components
  // from the common editor panel, but manage it by itself directly.
  const { handlePropertyValueUpdate } = usePropertyValueUpdate();

  const handleTextUpdate = useCallback(
    (text: string) => {
      const schemaGroup = block?.property?.items?.find(
        i => i.schemaGroup === "default",
      )?.schemaGroup;
      if (!block?.property?.id || !schemaGroup) return;
      handlePropertyValueUpdate(schemaGroup, block?.property?.id, "text", "string")(text);
    },
    [block?.property?.id, block?.property?.items, handlePropertyValueUpdate],
  );

  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      isEmpty={false}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      withCustomEditor
      renderItem={({ editMode }) => (
        <RichTextEditor
          editMode={editMode}
          text={text}
          onChange={handleTextUpdate}
          scrollableContainerId="story-page"
        />
      )}
      {...props}
    />
  );
};

export default TextBlock;
