import { FC, useCallback, useState } from "react";

import {
  Button,
  Icon,
  IconName,
  PopupMenuItem,
  Selector,
  TextInput,
  Typography,
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type HeaderProps = {
  viewState: string;
  title: string;
  icon?: IconName;
  isSearch?: boolean;
  searchTerm?: string;
  searchResultItems?: PopupMenuItem[];
  options?: { value: string; label?: string }[];
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  onClick: () => void;
  onChangeView?: (v?: string) => void;
  onSortChange?: (value?: string) => void;
  onSearch?: (value?: string) => void;
};

const CommonHeader: FC<HeaderProps> = ({
  title,
  icon,
  viewState,
  options,
  appearance,
  isSearch,
  searchTerm,
  onClick,
  onChangeView,
  onSortChange,
  onSearch,
}) => {
  const theme = useTheme();
  const t = useT();
  const [searchInputValue, setSearchInputValue] = useState<string>(searchTerm ?? "");

  const onChange = useCallback(
    (value: string | string[]) => {
      console.log("value", value);
      onSortChange?.(value as string);
    },
    [onSortChange],
  );

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInputValue(value);
    },
    [setSearchInputValue],
  );

  const SearchIcon: FC = () => (
    <IconWrepper onClick={() => onSearch?.(searchInputValue)}>
      <Icon icon="magnifyingGlass" size="small" color={theme.content.weak} />
    </IconWrepper>
  );
  return (
    <Header>
      <Button title={title} icon={icon} appearance={appearance} onClick={onClick} />

      <Actions>
        {isSearch && (
          <SearchWrepper>
            <TextInput
              value={searchInputValue}
              actions={[SearchIcon]}
              placeholder={t("Type key word to search")}
              onChange={handleSearchInputChange}
              onBlur={() => onSearch?.(searchInputValue)}
            />
          </SearchWrepper>
        )}
        <Typography size="body">{t("Sort")}: </Typography>
        <SelectorContainer>
          <Selector options={options || []} onChange={onChange} />
        </SelectorContainer>

        <Button
          iconButton
          icon="grid"
          iconColor={viewState === "grid" ? theme.content.main : theme.content.weak}
          appearance="simple"
          onClick={() => onChangeView?.("grid")}
          size="small"
        />
        <Button
          iconButton
          icon="list"
          iconColor={viewState === "list" ? theme.content.main : theme.content.weak}
          appearance="simple"
          disabled={icon === "uploadSimple" ? true : false}
          onClick={() => onChangeView?.("list")}
          size="small"
        />
      </Actions>
    </Header>
  );
};

export default CommonHeader;

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing.largest,
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));

const SearchWrepper = styled("div")(() => ({ minWidth: "250px" }));
const SelectorContainer = styled("div")(() => ({ minWidth: "130px" }));

const IconWrepper = styled("div")(() => ({
  cursor: "pointer",
}));
