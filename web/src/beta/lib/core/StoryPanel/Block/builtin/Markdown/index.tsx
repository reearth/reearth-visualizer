import { useCallback, useMemo } from "react";

import { ValueTypes } from "@reearth/beta/utils/value";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import usePropertyValueUpdate from "../common/useActionPropertyApi";
import BlockWrapper from "../common/Wrapper";

import MdEditor from "./Editor";

export type Props = BlockProps;

const MdBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "text") as ValueTypes["string"],
    [block?.property?.items],
  );

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
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      settingsEnabled={false}
      {...props}>
      <MdEditor text={text} onUpdate={handleTextUpdate} />
    </BlockWrapper>
  );
};

export default MdBlock;
