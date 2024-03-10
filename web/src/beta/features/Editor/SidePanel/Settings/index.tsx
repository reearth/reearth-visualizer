import { useMemo } from "react";

import PropertyItem from "@reearth/beta/components/fields/Property/PropertyItem";
import { filterVisibleItems } from "@reearth/beta/components/fields/utils";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { type Item } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  id: string;
  propertyItems?: Item[];
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const Settings: React.FC<Props> = ({ id, propertyItems, currentCamera, onFlyTo }) => {
  const t = useT();
  const visibleItems = useMemo(() => filterVisibleItems(propertyItems), [propertyItems]);
  return (
    <Wrapper>
      {visibleItems?.map((i, idx) => (
        <SidePanelSectionField title={i.title ?? t("Settings")} key={idx}>
          <PropertyItem
            key={i.id}
            propertyId={id}
            item={i}
            currentCamera={currentCamera}
            onFlyTo={onFlyTo}
          />
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
