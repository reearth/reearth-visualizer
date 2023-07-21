import { FC } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  text: string;
  border?: boolean;
  isSelected?: boolean;
  onItemClick: (id: string) => void;
  onActionClick?: () => void;
};

const ListItem: FC<Props> = ({ text, border, isSelected, onItemClick, onActionClick }) => {
  return (
    <Wrapper>
      <Inner border={border} isSelected={isSelected} onClick={() => onItemClick("id")}>
        <StyledText size="footnote">{text}</StyledText>
      </Inner>
      {onActionClick && (
        <Button onClick={onActionClick}>
          <Icon icon="actionbutton" size={12} />
        </Button>
      )}
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Inner = styled.button<{ border?: boolean; isSelected?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  border: 1px solid ${({ border }) => (border ? "#383838" : "transparent")};
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 20px 8px 4px;
  background: ${({ theme, isSelected }) => (isSelected ? theme.general.select : "inherit")};
  transition: all 0.15s;

  :hover {
    background: #232226;
  }
`;

const StyledText = styled(Text)`
  flex-grow: 1;
  width: 0;
  word-break: break-all;
  text-align: left;
`;

const Button = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  margin-left: -1px;

  color: #4a4a4a;
`;
