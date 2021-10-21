import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

const AuthPage: React.FC = ({ children }) => {
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
    `linear-gradient(70deg, ${theme.main.brandBlue} 10%, ${theme.main.brandRed} 60%, ${theme.main.brandBlue} 90%)`};
`;

const FormWrapper = styled(Flex)`
  background: ${({ theme }) => theme.other.white};
  border-radius: 5px;
  width: 306px;
  padding: 48px;
  color: ${({ theme }) => theme.main.weak};

  > .form-item {
    margin-bottom: 24px;
  }
`;

export default AuthPage;
