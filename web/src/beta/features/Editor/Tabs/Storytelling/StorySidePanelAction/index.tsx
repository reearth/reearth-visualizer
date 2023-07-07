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
    <SWrapper onClick={onClick} type="button">
      <SIcon>
        <Icon icon={icon} size={iconSize ?? 12} color={iconColor} />
      </SIcon>
      <Text size={"footnote"} otherProperties={{ wordBreak: "break-all", textAlign: "left" }}>
        {title}
      </Text>
    </SWrapper>
  );
};

const SWrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 6px;

  min-height: 28px;
  transition: all 0.15s;

  border: 1px solid #383838;

  :hover {
    background: ${props => props.theme.general.bg.weak};
  }
  user-select: none;
  cursor: pointer;
`;

const SIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a4a4a;
`;

export default StorySidePanelAction;
