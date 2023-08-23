import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

type Props = {
  icon?: string;
};

const Template: React.FC<Props> = ({ icon }) => {
  return (
    <Wrapper>
      <Icon icon={icon ?? "plugin"} size={32} />
    </Wrapper>
  );
};

export default Template;

const Wrapper = styled.div`
  display: flex;
  height: 255px;
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #e0e0e0;
  color: #a8a8a8;
`;
