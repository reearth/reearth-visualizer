import Flex from "@reearth/beta/components/Flex";
import Icon, { Icons } from "@reearth/beta/components/Icon";
import Overlay from "@reearth/beta/components/Overlay";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  title?: string;
  content?: string;
  icon?: Icons;
  show?: boolean;
};

const OverlayWithMessage: React.FC<Props> = ({ title, content, icon, show }) => {
  const theme = useTheme();
  return (
    <>
      <Overlay show={show} strong />
      <Wrapper show={show}>
        <Content direction="column" align="center" show={show}>
          <Icon icon={icon} size={60} color={theme.classic.main.danger} />
          <Text size="l" color={theme.classic.main.strongText}>
            {title}
          </Text>
          <Text size="m">{content}</Text>
        </Content>
      </Wrapper>
    </>
  );
};

export default OverlayWithMessage;

const Wrapper = styled.div<{ show?: boolean }>`
  position: absolute;
  top: 35%;
  left: 0;
  right: 0;
  z-index: 1;
  ${({ show }) => !show && "pointer-events: none;"}
`;

const Content = styled(Flex) <{ show?: boolean }>`
  margin: 0 auto;
  position: relative;
  width: 292px;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.2s;
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  transition: all 0.4s;
  transition-timing-function: ${({ show }) => (show ? "ease-in" : "ease-out")};
  text-align: center;

  * {
    margin-bottom: 16px;
  }
`;
