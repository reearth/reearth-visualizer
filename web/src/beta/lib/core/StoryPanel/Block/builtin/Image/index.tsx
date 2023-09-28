import { useMemo } from "react";

import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import type { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

const ImageBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  const src = useMemo(() => block?.property?.src as ValueTypes["string"], [block?.property?.src]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
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
