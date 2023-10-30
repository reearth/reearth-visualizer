import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Icon from "../Icon";

type Props = {
  customHeader?: string;
  customMessage?: string;
  customType?: "error" | "warning";
};

const NotFound: React.FC<Props> = ({ customHeader, customMessage, customType }) => {
  const t = useT();

  return (
    <Wrapper>
      <InnerWrapper>
        <IconWrapper>
          <Icon icon="logo" />
          <Icon icon="cancel" size={110} color={customType === "warning" ? "yellow" : "red"} />
        </IconWrapper>
        <Text size="h1">{customHeader ?? `404 ${t("Not found")}`}</Text>
        {customMessage && <CustomMessage size="h3">{customMessage}</CustomMessage>}
      </InnerWrapper>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 30vh;
  height: 100%;
  background: ${({ theme }) => theme.bg[1]};
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 40vw;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5vh;
  min-width: 260px;
  max-width: 20vw;
`;

const CustomMessage = styled(Text)`
  margin-top: 10px;
`;
