import { FC, useMemo } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { filterVisibleItems } from "@reearth/beta/ui/fields/utils";
import type { FlyTo } from "@reearth/core";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  onFlyTo?: FlyTo;
};

const Settings: FC<Props> = ({ propertyId, propertyItems, onFlyTo }) => {
  const t = useT();
  const visibleItems = useMemo(() => filterVisibleItems(propertyItems), [propertyItems]);

  return (
    <Wrapper>
      {visibleItems?.map((i, idx) => (
        <Collapse key={idx} title={i.title ?? t("Settings")} size="small">
          <PropertyItem key={i.id} propertyId={propertyId} item={i} onFlyTo={onFlyTo} />
        </Collapse>
      ))}
    </Wrapper>
  );
};

export default Settings;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));
