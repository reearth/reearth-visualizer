import { useMemo } from "react";

import RichText from "@reearth/beta/lib/lexical/RichTextEditor";
import { ValueTypes } from "@reearth/beta/utils/value";

import BlockWrapper from "../../../../shared/components/BlockWrapper";
import { CommonProps as BlockProps } from "../../types";

import TextBlockEditor from "./Editor";

export type Props = BlockProps;

// Text block is very special, it will not edit values with field components
// from the common editor panel, but manage it by itself directly.

const TextBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => block?.property?.default?.text?.value as ValueTypes["string"],
    [block?.property?.default?.text?.value],
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
      {props.isEditable ? (
        <TextBlockEditor
          text={text}
          propertyId={block?.propertyId}
          isEditable={props.isEditable}
          onPropertyUpdate={props.onPropertyUpdate}
        />
      ) : (
        <RichText text={text} scrollableContainerId="story-page" />
      )}
    </BlockWrapper>
  );
};

export default TextBlock;
