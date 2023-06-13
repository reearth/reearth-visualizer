import styled from "@emotion/styled";
import { FC, useState } from "react";

import Icon from "../Icon";
import Text from "../Text";

type Props = {
  list: string[];
  selected?: string;
  onChange?: (label: string) => void;
};

const PublishStateSwitchField: FC<Props> = ({ list, onChange, selected }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown>
      <SelectedState onClick={() => setOpen(o => !o)}>
        <StatusCircle />
        <Text color="#888686" size="s">
          {selected ? selected : list[0]}
        </Text>
        <Icon
          icon={"arrowDown"}
          style={{
            width: "16px",
            height: "16px",
            color: "#888686",
          }}
        />
      </SelectedState>
      {open && (
        <StateLists onClick={() => setOpen(o => !o)}>
          <ListWrapper>
            {list.map((value, index) => (
              <ListItem key={index}>
                <MenuItemWrapper>
                  <Text color={"#888686"} size={"s"} onClick={() => onChange?.(value)}>
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
  flex-direction: row;
  align-items: center;
  padding: 4px 20px;
  gap: 8px;

  height: inherit;
  width: 100%;

  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  background: #171618;

  &:hover {
    background-color: #232226;
  }
`;

const StatusCircle = styled.object`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4c4c4c;
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
  background: #171618;
`;
const ListWrapper = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ListItem = styled.li`
  display: flex;
  &:hover {
    background-color: #232226;
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
