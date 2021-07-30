import React from "react";
import { check } from "prettier";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";
import { styled } from "@reearth/theme";

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
      onClick={() => onCheck?.(!check)}>
      <ImgWrapper cardSize={cardSize}>
        {url && /\.(jpg|jpeg|png|gif|svg|webp|GIF|JPG|JPEG|PNG|SVG|WEBP)$/.test(url) ? (
          <PreviewImage url={url} />
        ) : (
          <Icon icon={icon} size={iconSize} />
        )}
      </ImgWrapper>
      <FileName size={cardSize === "large" ? "m" : "xs"} cardSize={cardSize} customColor>
        {name}
      </FileName>
      {checked && (
        <StyledIcon
          icon="checkCircle"
          alt="checked"
          size={cardSize === "small" ? "18px" : "24px"}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<{ selected?: boolean; cardSize?: CardSize }>`
  background: ${props => props.theme.assetCard.bg};
  box-shadow: 0 6px 6px -6px ${props => props.theme.other.black};
  border: 1px solid
    ${props => (props.selected ? `${props.theme.assetCard.highlight}` : "transparent")};
  padding: ${({ cardSize }) =>
    cardSize === "small" ? "8px" : cardSize === "medium" ? "12px" : "20px"};
  width: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "192px" : "274px"};
  height: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "186px" : "257px"};
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.assetCard.text};
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.assetCard.bgHover};
    color: ${({ theme }) => theme.assetCard.textHover};
    box-shadow: 0 8px 7px -6px ${props => props.theme.other.black};
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
  margin-top: ${({ cardSize }) => (cardSize === "large" ? "16px" : "12px")};
  color: inherit;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  bottom: 7px;
  right: 7px;
  color: ${({ theme }) => theme.assetCard.highlight};
`;

export default AssetCard;
