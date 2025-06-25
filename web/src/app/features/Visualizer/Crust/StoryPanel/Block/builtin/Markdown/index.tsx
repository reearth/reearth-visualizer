import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/app/utils/value";
import { FC, useCallback, useMemo } from "react";

import { StoryBlock } from "../../../types";

import MdEditor from "./Editor";

export type Props = BlockProps<StoryBlock>;

const MdBlock: FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => block?.property?.default?.text?.value as ValueTypes["string"],
    [block?.property?.default?.text?.value]
  );

  const handlePropertyValueUpdate = useCallback(
    (
      schemaGroupId: string,
      propertyId: string,
      fieldId: string,
      vt: any,
      itemId?: string
    ) => {
      return async (v?: any) => {
        await props.onPropertyUpdate?.(
          propertyId,
          schemaGroupId,
          fieldId,
          itemId,
          vt,
          v
        );
      };
    },
    [props]
  );

  const handleTextUpdate = useCallback(
    (text: string) => {
      if (!block?.propertyId) return;
      handlePropertyValueUpdate(
        "default",
        block?.propertyId,
        "text",
        "string"
      )(text);
    },
    [block?.propertyId, handlePropertyValueUpdate]
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
      <MdEditor text={text} onUpdate={handleTextUpdate} />
    </BlockWrapper>
  );
};

export default MdBlock;
