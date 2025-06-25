import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import RichText from "@reearth/app/lib/lexical/RichTextEditor";
import { ValueTypes } from "@reearth/app/utils/value";
import { FC, useMemo } from "react";

import { StoryBlock } from "../../../types";

import TextBlockEditor from "./Editor";

export type Props = BlockProps<StoryBlock>;

// Text block is very special, it will not edit values with field components
// from the common editor panel, but manage it by itself directly.

const TextBlock: FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => block?.property?.default?.text?.value as ValueTypes["string"],
    [block?.property?.default?.text?.value]
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      {...props}
    >
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
