import { useMemo } from "react";

import PropertyItem from "@reearth/beta/components/fields/Property/PropertyItem";
import { filterVisibleItems } from "@reearth/beta/components/fields/utils";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import type { FlyTo } from "@reearth/core";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  onFlyTo?: FlyTo;
};

const Settings: React.FC<Props> = ({ propertyId, propertyItems, onFlyTo }) => {
  const t = useT();
  const visibleItems = useMemo(() => filterVisibleItems(propertyItems), [propertyItems]);

  return (
    <Wrapper>
      {visibleItems?.map((i, idx) => (
        <SidePanelSectionField title={i.title ?? t("Settings")} key={idx}>
          <PropertyItem key={i.id} propertyId={propertyId} item={i} onFlyTo={onFlyTo} />
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
