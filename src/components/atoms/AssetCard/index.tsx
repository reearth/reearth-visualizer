import React from "react";
import { check } from "prettier";
import Icon from "../Icon";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

type CardSize = "small" | "medium" | "large";

export type Props = {
  className?: string;
  name: string;
  url: string;
  isImage?: boolean;
  cardSize?: CardSize;
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
};

const AssetCard: React.FC<Props> = ({
  className,
  cardSize,
  checked,
  onCheck,
  url,
  isImage,
  name,
}) => {
  const theme = useTheme();
  return (
    <Wrapper
      className={className}
      checked={checked}
      size={cardSize}
      onClick={() => onCheck?.(!check)}>
      {checked && <StyledIcon icon="checkCircle" alt="checked" size={20} />}
      <ImgWrapper>{isImage ? <Img src={url} alt={name} /> : <Icon icon="file" />}</ImgWrapper>
      <FileName size="xs" color={theme.main.text}>
        {name}
      </FileName>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ checked?: boolean; size?: CardSize }>`
  background: ${props => props.theme.imageCard.bg};
  border: 1px solid
    ${props => (props.checked ? `${props.theme.imageCard.highlight}` : "transparent")};
  padding: 12px;
  width: ${props => (props.size === "small" ? "192px" : "")};
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: 160px;
  width: 168px;
  margin: 10px;
  cursor: pointer;
  &:hover {
    border: ${props => `solid 1px ${props.theme.imageCard.highlight}`};
  }
`;

const ImgWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 126px;
`;

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const FileName = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 8px;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${props => props.theme.imageCard.highlight};
`;

export default AssetCard;
