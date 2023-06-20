import { FC, useState } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

type Props = {
  list: string[];
  selected?: string;
  onChange?: (label: string) => void;
};

const PublishStateSwitchField: FC<Props> = ({ list, onChange, selected }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <Dropdown>
      <SelectedState onClick={() => setOpen(o => !o)}>
        <StatusCircle />
        <Text color={theme.general.button.secondary.main} size="footnote">
          {selected ? selected : list[0]}
        </Text>
        <Icon
          icon={"arrowDown"}
          size={16}
          style={{
            color: theme.general.button.secondary.main,
          }}
        />
      </SelectedState>
      {open && (
        <StateLists onClick={() => setOpen(o => !o)}>
          <ListWrapper>
            {list.map((value, index) => (
              <ListItem key={index}>
                <MenuItemWrapper>
                  <Text
                    color={theme.general.button.secondary.main}
                    size={"footnote"}
                    onClick={() => onChange?.(value)}>
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
  height: 100%;
  width: 100%;
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
  border-radius: 6px;
  background: ${props => props.theme.general.bg.veryStrong};

  &:hover {
    background-color: ${props => props.theme.general.bg.weak};
  }
`;

const StatusCircle = styled.object`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.general.button.secondary.contentDisable};
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
