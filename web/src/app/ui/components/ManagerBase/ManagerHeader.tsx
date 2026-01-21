import {
  IconButton,
  Selector,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import {
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState
} from "react";

type ManagerHeaderSize = "medium" | "large";
export type ManagerLayout = "grid" | "list";

export type ManagerHeaderProps = {
  actions?: ReactNode[];
  size?: ManagerHeaderSize;
  layout?: ManagerLayout;
  onLayoutChange?: (value: ManagerLayout) => void;
  sortValue?: string;
  sortOptions?: { value: string; label?: string }[];
  onSortChange?: (value: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value?: string) => void;
  enableDelete?: boolean;
  deleteText?: string;
  selectedIds?: string[];
  onCancelSelect?: () => void;
  onDelete?: (ids: string[]) => void;
};

export const ManagerHeader: FC<ManagerHeaderProps> = ({
  actions,
  size = "medium",
  layout = "grid",
  onLayoutChange,
  sortValue,
  sortOptions,
  onSortChange,
  showSearch = true,
  searchPlaceholder,
  onSearch,
  enableDelete,
  deleteText,
  selectedIds,
  onCancelSelect,
  onDelete
}) => {
  const t = useT();

  const handleSortChange = useCallback(
    (value: string | string[]) => {
      if (typeof value !== "string") return;
      onSortChange?.(value);
    },
    [onSortChange]
  );

  const handleLayoutChange = useCallback(
    (e: MouseEvent, value: ManagerLayout) => {
      e.stopPropagation();
      onLayoutChange?.(value);
    },
    [onLayoutChange]
  );

  const handleCancelSelect = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onCancelSelect?.();
    },
    [onCancelSelect]
  );

  const handleDelete = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onDelete?.(selectedIds ?? []);
    },
    [onDelete, selectedIds]
  );

  const showDelete = enableDelete && selectedIds && selectedIds.length > 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchHovered, setSearchHovered] = useState(false);

  const handleSearch = useCallback(() => {
    onSearch?.(searchTerm);
  }, [searchTerm, onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    onSearch?.();
  }, [onSearch]);

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onSearch?.(searchTerm);
      }
    },
    [searchTerm, onSearch]
  );

  const searchActions = useMemo(() => {
    return [
      !!searchTerm && searchHovered && (
        <IconButton
          key="clear-search"
          icon="close"
          appearance="simple"
          size="smallest"
          onClick={handleClearSearch}
        />
      ),
      <IconButton
        key="search"
        icon="magnifyingGlass"
        appearance="simple"
        size="smallest"
        onClick={handleSearch}
      />
    ];
  }, [searchTerm, searchHovered, handleClearSearch, handleSearch]);

  return (
    <Wrapper size={size}>
      <Actions>{actions}</Actions>
      <Tools>
        {showDelete && (
          <DeleteBar>
            <IconButton
              icon="close"
              appearance="simple"
              onClick={handleCancelSelect}
            />
            <Typography size="body">{deleteText ?? t("Delete")}</Typography>
            <IconButton
              icon="trash"
              appearance="simple"
              onClick={handleDelete}
            />
          </DeleteBar>
        )}
        {!showDelete && showSearch && (
          <Search
            size={size}
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
          >
            <TextInput
              size="normal"
              extendWidth
              actions={searchActions}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={setSearchTerm}
              onKeyDown={handleSearchKeyDown}
            />
          </Search>
        )}
        {!showDelete && sortOptions && (
          <Sort>
            <Typography size="body" otherProperties={{ flexShrink: 0 }}>
              {t("Sort:")}
            </Typography>
            <Selector
              value={sortValue}
              options={sortOptions}
              onChange={handleSortChange}
            />
          </Sort>
        )}
        {!showDelete && (
          <Layouts>
            <IconButton
              data-testid="grid-layout"
              icon="grid"
              appearance="simple"
              active={layout === "grid"}
              tooltipText={t("Grid Layout")}
              onClick={(e) => handleLayoutChange(e, "grid")}
            />
            <IconButton
              icon="list"
              appearance="simple"
              active={layout === "list"}
              tooltipText={t("List Layout")}
              onClick={(e) => handleLayoutChange(e, "list")}
            />
          </Layouts>
        )}
      </Tools>
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ size: ManagerHeaderSize }>(
  ({ theme, size }) => ({
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: size === "medium" ? theme.spacing.normal : theme.spacing.largest,
    minHeight: size === "medium" ? "56px" : "76px",
    boxSizing: "border-box",
    flexGrow: 0
  })
);

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

const Tools = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing.normal,
  flex: 1
}));

const Sort = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  width: 200
}));

const Layouts = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small
}));

const Search = styled("div")<{ size: ManagerHeaderSize }>(
  ({ theme, size }) => ({
    display: "flex",
    gap: theme.spacing.small,
    maxWidth: size === "large" ? 250 : undefined,
    flex: 1
  })
);

const DeleteBar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  backgroundColor: theme.select.weak,
  borderRadius: theme.radius.small,
  height: 36,
  padding: `0 ${theme.spacing.small}px`
}));
