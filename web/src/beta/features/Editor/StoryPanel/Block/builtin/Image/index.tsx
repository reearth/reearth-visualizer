import { styled } from "@reearth/services/theme";

import Template from "../../Template";
import { BlockProps } from "../../types";

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
    src = "https://upload.wikimedia.org/wikipedia/en/a/a5/Pok%C3%A9mon_Charmander_art.png",
    // src,
    padding = { top: 10, bottom: 20, left: 30, right: 10 },
  } = block?.property ?? {};
  return (
    <Wrapper>
      <Block src={src} padding={padding}>
        {src ? <Image src={src} /> : <Template />}
      </Block>
    </Wrapper>
  );
};

export default ImageBlock;

const Wrapper = styled.div`
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  transition: all 0.3s;

  :hover {
    padding: 1px;
    border-color: ${({ theme }) => theme.select.weaker};
  }
`;

const Block = styled.div<{ src?: string; padding?: Spacing }>`
  display: flex;
  min-height: 255px;
  padding-top: ${({ padding, src }) => (src ? padding?.top + "px" : 0)};
  padding-bottom: ${({ padding, src }) => (src ? padding?.bottom + "px" : 0)};
  padding-left: ${({ padding, src }) => (src ? padding?.left + "px" : 0)};
  padding-right: ${({ padding, src }) => (src ? padding?.right + "px" : 0)};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;
