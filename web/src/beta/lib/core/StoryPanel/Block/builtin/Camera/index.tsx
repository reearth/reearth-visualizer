import { useEffect, useMemo } from "react";

import BlockWrapper from "../../../../shared/components/BlockWrapper";
import type { CommonProps as BlockProps } from "../../types";

import Content from "./Content";
import { type CameraBlock as CameraBlockType } from "./Editor";

export type Props = BlockProps;

const CameraBlock: React.FC<Props> = ({ block, isSelected, onPropertyItemAdd, ...props }) => {
  const cameraButtons = useMemo(
    () => (block?.property?.default ?? []) as CameraBlockType[],
    [block?.property?.default],
  );

  // if there's no item add 1 button.
  // TODO: Should be added to block creationAPI for generic blocks that require at least 1 item
  useEffect(() => {
    if (!block?.property?.default || block?.property?.default.length === 0) {
      onPropertyItemAdd?.(block?.propertyId, "default");
    }
  }, [block?.propertyId, block?.property?.default, onPropertyItemAdd]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      onPropertyItemAdd={onPropertyItemAdd}
      {...props}>
      <Content
        cameraButtons={cameraButtons}
        propertyId={block?.propertyId}
        isEditable={props.isEditable}
        onPropertyUpdate={props.onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemMove={props.onPropertyItemMove}
        onPropertyItemDelete={props.onPropertyItemDelete}
      />
    </BlockWrapper>
  );
};

export default CameraBlock;
