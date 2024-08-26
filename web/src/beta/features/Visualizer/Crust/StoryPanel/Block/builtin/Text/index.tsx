import { FC, useMemo } from "react";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import RichText from "@reearth/beta/lib/lexical/RichTextEditor";
import { ValueTypes } from "@reearth/beta/utils/value";

import { StoryBlock } from "../../../types";

import TextBlockEditor from "./Editor";

export type Props = BlockProps<StoryBlock>;

// Text block is very special, it will not edit values with field components
// from the common editor panel, but manage it by itself directly.

const TextBlock: FC<Props> = ({ block, isSelected, ...props }) => {
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
