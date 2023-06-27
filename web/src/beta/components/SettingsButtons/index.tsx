import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export interface Props {
  title: string;
  icon: string;
  onBlock?: () => void;
  onEdit?: () => void;
  onSetting?: () => void;
}

const SettingsButtons: React.FC<Props> = ({ title, icon, onBlock, onEdit, onSetting }) => {
  const theme = useTheme();

  return (
    <Wrapper>
      <StyledMainIcon size={16} onClick={onBlock} icon={icon} />
      <Text
        size={"xFootnote"}
        color={theme.general.content.strong}
        otherProperties={{ padding: "0px 4px" }}
        onClick={onBlock}>
        {title}
      </Text>
      <StyledSubIcon size={12} icon={"editIcon"} onClick={onEdit} />
      <StyledSubIcon size={12} icon={"settings"} onClick={onSetting} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  height: 100%;
  background: ${props => props.theme.general.select};
`;

const StyledMainIcon = styled(Icon)`
  padding: 2px;
  cursor: pointer;
`;

const StyledSubIcon = styled(Icon)`
  padding: 4px;
  justify-items: center;
  border-left: 0.5px solid ${props => props.theme.general.content.strong};
  cursor: pointer;
`;

export default SettingsButtons;
