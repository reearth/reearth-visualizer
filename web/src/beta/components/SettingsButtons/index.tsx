import React from "react";

import { styled } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

export interface Props {
  title: string;
  icon: string;
  onBlock?: () => void;
  onEdit?: () => void;
  onSetting?: () => void;
}

const SettingsButtons: React.FC<Props> = ({ title, icon, onBlock, onEdit, onSetting }) => {
  return (
    <Wrapper>
      <Icon
        size={20}
        style={{
          padding: "2px",
        }}
        onClick={onBlock}
        icon={icon}
      />
      <Text size={"s"} color="white" otherProperties={{ padding: "2px" }} onClick={onBlock}>
        {title}
      </Text>
      <Icon
        size={20}
        style={{
          padding: "2px",
          borderLeft: "0.5px solid #ffffff",
        }}
        icon={"editIcon"}
        onClick={onEdit}
      />
      <Icon
        size={20}
        style={{
          padding: "2px",
          borderLeft: "0.5px solid #ffffff",
        }}
        icon={"settings"}
        onClick={onSetting}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;

  width: 100%;
  height: 100%;
  background: ${props => props.theme.infoBox.accent2};
`;

export default SettingsButtons;
