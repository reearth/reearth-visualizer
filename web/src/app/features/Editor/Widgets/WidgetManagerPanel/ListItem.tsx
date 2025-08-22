import { EntryItem } from "@reearth/app/ui/components";
import {
  InstalledWidget,
  DATA_ATTRIBUTION_WIDGET_ID
} from "@reearth/services/api/widgetsApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

type ListItemProps = {
  item: InstalledWidget;
  selected?: boolean;
  onItemDelete?: (id: string) => void;
  onItemSelect?: (id: string) => void;
};

const ListItem: FC<ListItemProps> = ({
  item,
  selected,
  onItemDelete,
  onItemSelect
}) => {
  const t = useT();
  const optionsMenu = useMemo(
    () => [
      {
        id: "delete",
        title: t("Delete"),
        icon: "trash" as const,
        disabled: `${item.pluginId}/${item.extensionId}` === DATA_ATTRIBUTION_WIDGET_ID,
        onClick: () => onItemDelete?.(item.id)
      }
    ],
    [item.extensionId, item.id, onItemDelete, t]
  );

  return (
    <Wrapper data-testid={`installed-widget-list-item-${item.id}`}>
      <EntryItem
        title={<TitleWrapper>{item.title}</TitleWrapper>}
        optionsMenu={optionsMenu}
        highlighted={selected}
        optionsMenuWidth={100}
        onClick={() => onItemSelect?.(item.id)}
        data-testid={`entry-item-${item.id}`}
      />
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center"
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));
