import { useMemo } from "react";

import { styled } from "@reearth/services/theme";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";
import { getFieldValue } from "../utils";

const ImageBlock: React.FC<BlockProps> = ({ block, isSelected, onClick, onRemove }) => {
  const src = useMemo(() => getFieldValue("src", block?.property?.items), [block?.property?.items]);

  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      onClick={onClick}
      onRemove={onRemove}>
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
