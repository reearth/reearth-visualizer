import TextInput from "@reearth/beta/components/properties/TextInput";
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
          {p.schemaFields.map(sf =>
            sf.type === "string" ? (
              <TextInput key={sf.id} name={sf.name} description={"asdf"} />
            ) : (
              <p key={sf.id}>{sf.name}</p>
            ),
          )}
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
  background: ${({ theme }) => theme.bg[1]};
  border-radius: 4px;
`;
