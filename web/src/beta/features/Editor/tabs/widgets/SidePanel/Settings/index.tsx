import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { type Item } from "@reearth/services/api/propertyApi";
import { styled } from "@reearth/services/theme";

type Props = {
  properties?: Item[];
};

const Settings: React.FC<Props> = ({ properties }) => {
  console.log("P: ", properties);
  return (
    <Wrapper>
      {properties?.map((p, idx) => (
        <SidePanelSectionField title={p.title ?? "Undefined"} key={idx}>
          <Item>{p.title}</Item>
        </SidePanelSectionField>
      ))}
    </Wrapper>
  );
};

export default Settings;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  padding: 8px;
  background: ${({ theme }) => theme.general.bg.main};
  border-radius: 4px;
`;
