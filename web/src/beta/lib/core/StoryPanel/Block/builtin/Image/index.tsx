import { useMemo } from "react";

import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/lib/core/shared/types";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { StoryBlock } from "../../../types";

const ImageBlock: React.FC<BlockProps<StoryBlock>> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src],
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
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
