import { EntryItem } from "@reearth/beta/ui/components";
import { InstalledWidget } from "@reearth/services/api/widgetsApi/utils";
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
  const optionsMenu = useMemo(
    () => [
      {
        id: "delete",
        title: "Delete",
        icon: "trash" as const,
        onClick: () => onItemDelete?.(item.id)
      }
    ],
    [item.id, onItemDelete]
  );

  return (
    <Wrapper>
      <EntryItem
        title={<TitleWrapper>{item.title}</TitleWrapper>}
        optionsMenu={optionsMenu}
        highlighted={selected}
        optionsMenuWidth={100}
        onClick={() => onItemSelect?.(item.id)}
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
