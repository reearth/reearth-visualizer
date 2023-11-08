import { useMemo } from "react";

import type { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

import Content from "./Content";
import { type CameraBlock as CameraBlockType } from "./Editor";

export type Props = BlockProps;

const CameraBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const cameraButtons = useMemo(
    () => Object.values(block?.property?.default ?? []) as CameraBlockType[],
    [block?.property?.default],
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
      <Content
        cameraButtons={cameraButtons}
        propertyId={block?.propertyId}
        isEditable={props.isEditable}
      />
    </BlockWrapper>
  );
};

export default CameraBlock;
