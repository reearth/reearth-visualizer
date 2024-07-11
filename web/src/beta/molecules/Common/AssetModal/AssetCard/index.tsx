import React from "react";

import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { styled } from "@reearth/services/theme";

type CardSize = "small" | "medium" | "large";

export type Props = {
  className?: string;
  name: string;
  url?: string;
  icon?: string;
  iconSize?: string;
  cardSize?: CardSize;
  checked?: boolean;
  selected?: boolean;
  onCheck?: (checked: boolean) => void;
};

const AssetCard: React.FC<Props> = ({
  className,
  name,
  url,
  icon,
  iconSize,
  cardSize,
  checked,
  selected,
  onCheck,
}) => {
  return (
    <Wrapper
      className={className}
      direction="column"
      selected={selected}
      cardSize={cardSize}
      onClick={() => onCheck?.(!checked)}>
      <ImgWrapper cardSize={cardSize}>
        {!icon ? <PreviewImage url={url} /> : <Icon icon={icon} size={iconSize} />}
      </ImgWrapper>
      <Flex>
        <FileName size={cardSize === "large" ? "m" : "2xs"} cardSize={cardSize} customColor>
          {name}
        </FileName>
        {checked && (
          <StyledIcon
            icon="checkCircle"
            alt="checked"
            size={cardSize === "small" ? "18px" : "24px"}
          />
        )}
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<{ selected?: boolean; cardSize?: CardSize }>`
  background: ${({ selected, theme }) =>
    selected ? theme.classic.assetCard.bgHover : theme.classic.assetCard.bg};
  box-shadow: 0 6px 6px -6px ${props => props.theme.classic.other.black};
  border: 2px solid
    ${props => (props.selected ? `${props.theme.classic.assetCard.highlight}` : "transparent")};
  padding: ${({ cardSize }) =>
    cardSize === "small" ? "8px" : cardSize === "medium" ? "12px" : "20px"};
  width: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "192px" : "274px"};
  height: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "186px" : "257px"};
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.classic.assetCard.text};
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.classic.assetCard.bgHover};
    color: ${({ theme }) => theme.classic.assetCard.textHover};
    box-shadow: 0 8px 7px -6px ${props => props.theme.classic.other.black};
  }
`;

const ImgWrapper = styled.div<{ cardSize?: CardSize; url?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ cardSize }) =>
    cardSize === "small" ? "77px" : cardSize === "medium" ? "126px" : "175px"};
`;

const PreviewImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.url})`};
  background-size: cover;
  background-position: center;
`;

const FileName = styled(Text)<{ cardSize?: CardSize }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: ${({ cardSize }) => (cardSize === "large" ? "12px" : "8px")};
  color: inherit;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  bottom: 7px;
  right: 7px;
  color: ${({ theme }) => theme.classic.assetCard.highlight};
`;

export default AssetCard;
