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
        size={16}
        style={{
          padding: "2px",
        }}
        onClick={onBlock}
        icon={icon}
      />
      <Text size={"2xs"} color="white" otherProperties={{ padding: "0px 4px" }} onClick={onBlock}>
        {title}
      </Text>
      <Icon
        size={12}
        style={{
          justifyItems: "center",
          padding: "4px",
          borderLeft: "0.5px solid #ffffff",
        }}
        icon={"editIcon"}
        onClick={onEdit}
      />
      <Icon
        size={12}
        style={{
          padding: "4px",
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
  align-items: center;

  height: 100%;
  background: ${props => props.theme.infoBox.accent2};
`;

export default SettingsButtons;
