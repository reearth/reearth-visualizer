import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

const Template: React.FC = () => {
  return (
    <Wrapper>
      <Icon icon="plugin" />
    </Wrapper>
  );
};

export default Template;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  background-color: #e0e0e0;
  color: #a8a8a8;
`;
