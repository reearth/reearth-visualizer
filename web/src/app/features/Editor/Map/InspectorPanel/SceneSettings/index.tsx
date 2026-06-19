import { Collapse } from "@reearth/app/lib/reearth-ui";
import PropertyItem, { FieldContext } from "@reearth/app/ui/fields/Properties";
import { PropertyFieldDecorations } from "@reearth/app/ui/fields/Properties/PropertyField";
import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import type { FlyTo } from "@reearth/core";
import type { Item } from "@reearth/services/api/property";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  onFlyTo?: FlyTo;
  computeDecorations?: (
    schemaId: string,
    schemaGroup: string,
    value: unknown,
    allFields: FieldContext[],
    allListItemsFields?: FieldContext[][]
  ) => PropertyFieldDecorations;
};

const Settings: FC<Props> = ({
  propertyId,
  propertyItems,
  onFlyTo,
  computeDecorations
}) => {
  const t = useT();
  const visibleItems = useMemo(
    () => filterVisibleItems(propertyItems),
    [propertyItems]
  );

  return (
    <Wrapper>
      {visibleItems?.map((i) => (
        <Collapse
          key={i.schemaGroup}
          title={i.title ?? t("Settings")}
          size="small"
        >
          <PropertyItem
            key={i.id}
            propertyId={propertyId}
            item={i}
            onFlyTo={onFlyTo}
            computeDecorations={computeDecorations}
          />
        </Collapse>
      ))}
    </Wrapper>
  );
};

export default Settings;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));
