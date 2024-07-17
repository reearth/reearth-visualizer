import { FC, useMemo } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { filterVisibleItems } from "@reearth/beta/ui/fields/utils";
import type { FlyTo } from "@reearth/core";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  onFlyTo?: FlyTo;
};

const Settings: FC<Props> = ({ propertyId, propertyItems, onFlyTo }) => {
  const t = useT();
  const visibleItems = useMemo(() => filterVisibleItems(propertyItems), [propertyItems]);

  const theme = useTheme();
  return (
    <Wrapper>
      {visibleItems?.map((i, idx) => (
        <PropertyWrapper key={idx}>
          <Typography size="body" color={theme.content.main}>
            {i.title ?? t("Settings")}
          </Typography>
          <PropertyItem key={i.id} propertyId={propertyId} item={i} onFlyTo={onFlyTo} />
        </PropertyWrapper>
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

const PropertyWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.small,
  flexGrow: 1,
  overflowY: "auto",
}));
