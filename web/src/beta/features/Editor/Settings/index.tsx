import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const Settings: React.FC<Props> = ({ propertyId, propertyItems, currentCamera, onFlyTo }) => (
  <Wrapper>
    {propertyItems?.map((i, idx) => (
      <SidePanelSectionField title={i.title ?? "Undefined"} key={idx}>
        <FieldComponents
          propertyId={propertyId}
          item={i}
          currentCamera={currentCamera}
          onFlyTo={onFlyTo}
        />
      </SidePanelSectionField>
    ))}
  </Wrapper>
);

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
