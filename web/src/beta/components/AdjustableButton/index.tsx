import { styled } from "@reearth/services/theme";

export type Props = {
  onClick: () => void;
};

const AdjustableButton: React.FC<Props> = ({ onClick }) => {
  return (
    <AdjustableButtonContainer>
      <AdjustableButtonStyled onClick={onClick}>+</AdjustableButtonStyled>
    </AdjustableButtonContainer>
  );
};

const AdjustableButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AdjustableButtonStyled = styled.button`
  background-color: black;
  color: white;
  border: none;
  width: 50%;
  height: 80%;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: darkgray;
  }

  &:active {
    background-color: gray;
  }
`;

export default AdjustableButton;
