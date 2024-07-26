import { memo } from "react";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";

import { InfoboxBlock } from "../../../types";

import Content from "./Content";

const PropertyList: React.FC<BlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      {...props}>
      <Content block={block} {...props} />
    </BlockWrapper>
  );
};

export default memo(PropertyList);
