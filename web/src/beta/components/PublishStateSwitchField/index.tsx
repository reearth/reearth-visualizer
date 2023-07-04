import { useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

const PublishStateSwitchField: React.FC = () => {
  const t = useT();
  const labels = [t("Unpublished"), t("Published")];
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(t("Unpublished"));
  const theme = useTheme();

  return (
    <Dropdown>
      <SelectedState onClick={() => setOpen(o => !o)}>
        <StatusCircle isActive={selectedLabel === t("Published")} />
        <StyledText color={theme.general.button.secondary.main} size="footnote">
          {selectedLabel}
        </StyledText>
        <StyledIcon icon={"arrowDown"} size={16} />
      </SelectedState>
      {open && (
        <StateLists onClick={() => setOpen(o => !o)}>
          <ListWrapper>
            {labels.map(value => (
              <ListItem key={value} onClick={() => setSelectedLabel(value)}>
                <MenuItemWrapper>
                  <Text color={theme.general.button.secondary.main} size={"footnote"}>
                    {value}
                  </Text>
                </MenuItemWrapper>
              </ListItem>
            ))}
          </ListWrapper>
        </StateLists>
      )}
    </Dropdown>
  );
};
const Dropdown = styled.div`
  position: relative;
  height: 24px;
  width: 154px;
  cursor: pointer;
`;

const SelectedState = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 4px 20px;
  gap: 8px;

  height: inherit;
  width: 100%;

  border: 1px solid ${props => props.theme.general.bg.transparent};
  background: ${props => props.theme.general.bg.veryStrong};

  &:hover {
    background-color: ${props => props.theme.general.bg.weak};
  }
`;

const StyledText = styled(Text)`
  width: 74px;
  height: 16px;
`;

const StyledIcon = styled(Icon)`
  width: 16px;
  color: ${props => props.theme.general.button.secondary.main};
`;

const StatusCircle = styled.object<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props =>
    props.isActive
      ? props.theme.general.publishStatus.published
      : props.theme.general.publishStatus.unpublished};
`;

const StateLists = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: auto;
  bottom: 0;
  transform: translateY(100%);
  box-shadow: 6px 6px 8px rgba(0, 0, 0, 0.3);
  z-index: ${props => props.theme.zIndexes.dropDown};
  background: ${props => props.theme.general.bg.veryStrong};
`;
const ListWrapper = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ListItem = styled.li`
  display: flex;
  &:hover {
    background-color: ${props => props.theme.general.bg.weak};
  }
`;
const MenuItemWrapper = styled.div`
  display: flex;
  padding: 0 16px;
  align-items: center;
  min-height: 30px;
  cursor: pointer;
  height: 100%;
`;

export default PublishStateSwitchField;
