import { styled } from "@reearth/services/theme";

import { Spacing } from "../../mantle";

export type InfoboxPosition = "right" | "left";

export const PADDING_DEFAULT_VALUE = 10;
export const GAP_DEFAULT_VALUE = 10;
export const POSITION_DEFAULT_VALUE = "right";

export type Props = {
  //   size?: "small" | "medium" | "large";
  position?: InfoboxPosition;
  padding?: Spacing;
  gap?: number;
  visible?: boolean;
  blocks?: any;
};

const Infobox: React.FC<Props> = ({ visible, position = POSITION_DEFAULT_VALUE, padding, gap }) => {
  // Implement your component logic here

  return (
    // JSX code goes here
    <Wrapper visible={visible} position={position} padding={padding} gap={gap}>
      <Block>
        <h1>laskdfjslkdf</h1>
      </Block>
      <Block>
        <h1>laskdfjslkdf</h1>
      </Block>
      <Block>
        <h1>laskdfjslkdf</h1>
      </Block>
      <Block>
        <h1>laskdfjslkdf</h1>
      </Block>
      <Block>
        <h1>laskdfjslkdf</h1>
      </Block>
    </Wrapper>
  );
};

export default Infobox;

const Wrapper = styled.div<{
  visible?: boolean;
  position?: InfoboxPosition;
  padding?: Spacing;
  gap?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap ?? GAP_DEFAULT_VALUE}px;
  position: absolute;
  top: 37px;
  ${({ position }) => (position === "right" ? "right: 13px" : "left: 13px")};
  height: 515px;
  width: 323px;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  background: #ffffff;
  border-radius: 6px;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.infobox};
  box-sizing: border-box;
  overflow: scroll;
  padding-top: ${({ padding }) => padding?.top ?? PADDING_DEFAULT_VALUE}px;
  padding-bottom: ${({ padding }) => padding?.bottom ?? PADDING_DEFAULT_VALUE}px;
  padding-left: ${({ padding }) => padding?.left ?? PADDING_DEFAULT_VALUE}px;
  padding-right: ${({ padding }) => padding?.right ?? PADDING_DEFAULT_VALUE}px;
`;

const Block = styled.div`
  width: 100%;
  min-height: 120px;
  background: #e0e0e0;
`;
