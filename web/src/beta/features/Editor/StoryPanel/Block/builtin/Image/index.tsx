import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../Builtin/Wrapper";

export type Props = BlockProps<Property>;

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type Property = {
  src?: string;
  padding: Spacing;
};

const ImageBlock: React.FC<Props> = ({ block, isSelected, onClick, onRemove }) => {
  const {
    // src = "https://upload.wikimedia.org/wikipedia/en/a/a5/Pok%C3%A9mon_Charmander_art.png",
    src,
    padding = { top: 10, bottom: 20, left: 30, right: 10 },
  } = block?.property ?? {};

  const handleRemove = useCallback(() => onRemove?.(block?.id), [block?.id, onRemove]);

  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      padding={src ? padding : undefined}
      isSelected={isSelected}
      onClick={onClick}
      onRemove={handleRemove}>
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
