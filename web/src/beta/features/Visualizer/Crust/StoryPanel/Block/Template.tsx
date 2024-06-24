import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

type Props = {
  icon?: string;
  height?: number;
};

const Template: React.FC<Props> = ({ icon, height }) => {
  return (
    <Wrapper height={height}>
      <Icon icon={icon ?? "plugin"} size={32} />
    </Wrapper>
  );
};

export default Template;

const Wrapper = styled.div<{ height?: number }>`
  display: flex;
  height: ${({ height }) => `${height ?? 255}px`};
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #e0e0e0;
  color: #a8a8a8;
`;
