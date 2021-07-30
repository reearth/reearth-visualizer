import React, { useRef } from "react";
import { useClickAway } from "react-use";

import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";

export interface Item {
  id: string;
  name: string;
  icon?: string;
}

export interface ContentsPickerProps {
  className?: string;
  items?: Item[];
  onClickAway?: () => void;
  onSelect?: (index: number) => void;
}

const ContentPicker: React.FC<ContentsPickerProps> = ({
  className,
  items: items,
  onSelect,
  onClickAway,
}) => {
  const ref = useRef(null);
  useClickAway(ref, () => onClickAway?.());
  return (
    <Wrapper className={className} ref={ref}>
      <ContentsList>
        {items?.map((item, i) => (
          <ContentItem key={item.id}>
            <ContentButton onClick={() => onSelect?.(i)}>
              <StyledIcon icon={item.icon} size={20} />
              <ButtonText size="xs">{item.name}</ButtonText>
            </ContentButton>
          </ContentItem>
        ))}
        {new Array((items ?? []).length % 3).fill(undefined).map((_, i) => (
          <GhostButton key={i} />
        ))}
      </ContentsList>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${props => props.theme.infoBox.bg};
  margin-top: 5px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 3px;
  width: 288px;
  height: 160px;
  color: ${props => props.theme.infoBox.mainText};
  box-shadow: 0 0 5px ${props => props.theme.infoBox.deepBg};
  &:after {
    content: "";
    position: absolute;
    right: 0;
    top: -5px;
    left: 0;
    width: 0px;
    height: 0px;
    margin: auto;
    border-style: solid;
    border-color: transparent transparent ${props => props.theme.infoBox.bg} transparent;
    border-width: 0 10px 10px 10px;
  }
`;

const ContentsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 100%;
`;

const ContentItem = styled.div`
  flex: 0 0 33.33333%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentButton = styled.div`
  padding: 5px;
  width: 60px;
  border: solid 0.5px transparent;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-radius: 6px;
    border: solid 0.5px ${props => props.theme.main.select};
  }
`;

const GhostButton = styled.div`
  width: 30%;
`;

const ButtonText = styled(Text)`
  margin: 3px 0;
  user-select: none;
`;

const StyledIcon = styled(Icon)`
  display: block;
  margin: 0 auto;
`;

export default ContentPicker;
