import React from "react";

import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Icon from "../Icon";

const NotFound: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <div>
        <IconWrapper>
          <Icon icon="logo" />
          <Icon icon="cancel" size={110} color="red" />
        </IconWrapper>
        <Text size="h1">{`404 ${t("Not found")}`}</Text>
      </div>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 40vh;
  height: 100%;
  background: ${({ theme }) => theme.bg[2]};
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
