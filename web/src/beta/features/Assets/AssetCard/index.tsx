import React from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  name: string;
  url?: string;
  icon?: string;
  iconSize?: string;
  checked?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
};

const AssetCard: React.FC<Props> = ({
  className,
  name,
  url,
  icon,
  iconSize,
  checked,
  selected,
  onSelect,
}) => {
  return (
    <Wrapper className={className} selected={selected} onClick={() => onSelect?.(!selected)}>
      <ImgWrapper>
        {!icon ? <PreviewImage url={url} /> : <Icon icon={icon} size={iconSize} />}
      </ImgWrapper>
      <InfoWrapper>
        <FileName size="footnote">{name}</FileName>
        {checked && <StyledIcon icon="checkCircle" alt="checked" size="18px" />}
      </InfoWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.25);
  border: 2px solid ${({ selected, theme }) => (selected ? `${theme.select.main}` : "transparent")};
  padding: ${({ theme }) => theme.spacing.small}px;
  width: 100%;
  max-width: 120px;
  height: 100%;
  max-height: 103px;
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.content.main};
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const ImgWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75px;
`;

const InfoWrapper = styled.div`
  display: flex;
`;

const PreviewImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.url})`};
  background-size: cover;
  background-position: center;
`;

const FileName = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: ${({ theme }) => theme.spacing.small}px;
  color: inherit;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  bottom: 7px;
  right: 7px;
  color: ${({ theme }) => theme.select.main};
`;

export default AssetCard;
