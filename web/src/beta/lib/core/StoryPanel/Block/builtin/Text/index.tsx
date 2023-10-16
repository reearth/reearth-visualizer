import { useCallback, useMemo } from "react";

import { ValueTypes } from "@reearth/beta/utils/value";

import usePropertyValueUpdate from "../../../hooks/usePropertyValueUpdate";
import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

import TextBlockEditor from "./Editor";

export type Props = BlockProps;

// Text block is very special, it will not edit values with field components
// from the common editor panel, but manage it by itself directly.

const TextBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => block?.property?.default?.text?.value as ValueTypes["string"],
    [block?.property?.default?.text?.value],
  );

  const { handlePropertyValueUpdate } = usePropertyValueUpdate();

  const handleTextUpdate = useCallback(
    (text: string) => {
      if (!block?.propertyId) return;
      handlePropertyValueUpdate("default", block?.propertyId, "text", "string")(text);
    },
    [block, handlePropertyValueUpdate],
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      {...props}>
      <TextBlockEditor text={text} onUpdate={handleTextUpdate} />
    </BlockWrapper>
  );
};

export default TextBlock;
