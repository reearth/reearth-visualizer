import { ComponentProps, FC } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type IconProps = ComponentProps<typeof Icon>;

type Props = {
  icon: IconProps["icon"];
  iconSize?: IconProps["size"];
  iconColor?: IconProps["color"];
  title: string;
  onClick: () => void;
};

const StorySidePanelAction: FC<Props> = ({ icon, iconSize, iconColor, title, onClick }) => {
  return (
    <Wrapper onClick={onClick} type="button">
      <IconWrapper>
        <Icon icon={icon} size={iconSize ?? 12} color={iconColor} />
      </IconWrapper>
      <Text size={"footnote"} otherProperties={{ wordBreak: "break-all", textAlign: "left" }}>
        {title}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 6px;

  min-height: 28px;
  transition: all 0.15s;

  background: ${props => props.theme.bg[1]};
  border: 1px solid ${({ theme }) => theme.outline.weaker};

  :hover {
    background: ${props => props.theme.bg[2]};
  }
  user-select: none;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.content.weak};
`;

export default StorySidePanelAction;
