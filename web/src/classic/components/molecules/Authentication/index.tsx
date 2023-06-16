import { ReactNode } from "react";

import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import { styled } from "@reearth/services/theme";

const AuthPage: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <Wrapper>
      {children && (
        <Flex justify="center" align="center" flex={2}>
          <FormWrapper align="center" justify="center" direction="column">
            {children}
          </FormWrapper>
        </Flex>
      )}
      <Flex justify="center" align="center" flex={3}>
        <Icon icon="logo" size={250} />
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  height: 100%;
  background: ${({ theme }) =>
    `linear-gradient(79.71deg, 
      ${theme.classic.main.brandBlue} 0%, 
      ${theme.classic.main.brandRed} 25.9%, 
      ${theme.classic.main.brandRed} 34.81%, 
      ${theme.classic.main.brandBlue} 88.99%)
    `};
`;

const FormWrapper = styled(Flex)`
  background: ${({ theme }) => theme.classic.other.white};
  border-radius: 5px;
  width: 306px;
  padding: 48px;
  color: ${({ theme }) => theme.classic.main.weak};

  > .form-item {
    margin-bottom: 24px;
  }
`;

export default AuthPage;
