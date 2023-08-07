import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

type Props = {
  onClick: () => void;
};

const BlockAddBar: React.FC<Props> = ({ onClick }) => {
  return (
    <Wrapper>
      <Bar>
        <StyledIcon icon="plus" size={16} onClick={onClick} />
        <Line />
      </Bar>
    </Wrapper>
  );
};

export default BlockAddBar;

const Wrapper = styled.div`
  height: 0;
  position: relative;
`;

const Bar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: -14px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;

  * {
    opacity: 0;
  }

  :hover {
    * {
      opacity: 100%;
    }
  }
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.select.main};
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  transition: opacity 0.4s;
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.select.main};
  transition: opacity 0.4s;
`;
