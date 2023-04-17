import { ReactNode } from "react";

import Wrapper from "@reearth/components/atoms/Modal/ModalFrame";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  className?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  button1?: ReactNode;
  button2?: ReactNode;
  children?: ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
};

const Modal: React.FC<Props> = ({
  className,
  title,
  size,
  button1,
  button2,
  isVisible,
  onClose,
  children,
}) => {
  const theme = useTheme();
  return (
    <Wrapper className={className} size={size} isVisible={isVisible} onClose={onClose}>
      <Title size="l" weight="bold" color={theme.main.strongText}>
        {title}
      </Title>
      {children}
      <ButtonWrapper>
        {button2}
        {button1}
      </ButtonWrapper>
    </Wrapper>
  );
};

const Title = styled(Text)`
  text-align: center;
  margin-bottom: 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 20px -10px -10px 0;
`;

export default Modal;
