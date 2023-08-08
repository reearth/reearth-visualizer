import { styled } from "@reearth/services/theme";

import Template from "../../Template";
import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../Wrapper";

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

const ImageBlock: React.FC<Props> = ({ block }) => {
  const {
    // src = "https://upload.wikimedia.org/wikipedia/en/a/a5/Pok%C3%A9mon_Charmander_art.png",
    src,
    padding = { top: 10, bottom: 20, left: 30, right: 10 },
  } = block?.property ?? {};
  return (
    <BlockWrapper padding={src ? padding : undefined}>
      {src ? <Image src={src} /> : <Template />}
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
