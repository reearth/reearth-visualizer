import { useMemo } from "react";

import { styled } from "@reearth/services/theme";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

const ImageBlock: React.FC<BlockProps> = ({ block, isSelected, onClick, onRemove }) => {
  const src = useMemo(() => {
    const d = block?.property?.items?.find(i => i.schemaGroup === "default");
    const isList = d && "items" in d;
    const schemaField = d?.schemaFields.find(sf => sf.id === "src");
    return (!isList ? d?.fields.find(f => f.id === schemaField?.id) : schemaField?.defaultValue) as
      | string
      | undefined;
  }, [block?.property?.items]);

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
