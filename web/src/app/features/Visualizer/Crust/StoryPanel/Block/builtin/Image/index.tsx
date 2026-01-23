import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import { StoryBlock } from "../../../types";

const ImageBlock: FC<BlockProps<StoryBlock>> = ({
  block,
  isSelected,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}
    >
      {src && <Image src={src} />}
    </BlockWrapper>
  );
};

export default ImageBlock;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;
