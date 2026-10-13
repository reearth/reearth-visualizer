import {
  IconButton,
  Popup,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { EditorBadge } from "./Project/ProjectEditorInfo";

export type CreatorOption = {
  id: string;
  name: string;
  avatarURL?: string;
};

type Props = {
  creators: CreatorOption[];
  value?: string;
  onChange?: (creatorId?: string) => void;
};

const CreatorFilter: FC<Props> = ({ creators, value, onChange }) => {
  const t = useT();
  const theme = useTheme();

  const selected = useMemo(
    () => creators.find((c) => c.id === value),
    [creators, value]
  );

  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setQuery(selected?.name ?? "");
  }, [selected?.name]);

  // While the input still shows the selected creator, list everyone so the
  // user can switch to someone else without clearing the field first.
  const filteredCreators = useMemo(() => {
    const keyword = query === selected?.name ? "" : query.trim().toLowerCase();
    if (!keyword) return creators;
    return creators.filter((c) => c.name.toLowerCase().includes(keyword));
  }, [creators, query, selected?.name]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      // Text typed without picking anyone is discarded, so the field never
      // disagrees with the filter actually applied.
      if (!nextOpen) setQuery(selected?.name ?? "");
    },
    [selected?.name]
  );

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      setOpen(true);
      if (!text) onChange?.(undefined);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (creator: CreatorOption) => {
      setQuery(creator.name);
      setOpen(false);
      if (creator.id !== value) onChange?.(creator.id);
    },
    [value, onChange]
  );

  const handleClear = useCallback(
    (e: MouseEvent) => {
      // The input is the popup's trigger, so the click must not toggle it.
      e.stopPropagation();
      setQuery("");
      setOpen(false);
      onChange?.(undefined);
    },
    [onChange]
  );

  const actions = useMemo(
    () => [
      !!query && hovered && (
        <IconButton
          key="clear-creator"
          icon="close"
          appearance="simple"
          size="smallest"
          onClick={handleClear}
        />
      ),
      <IconButton
        key="search-creator"
        icon="magnifyingGlass"
        appearance="simple"
        size="smallest"
      />
    ],
    [query, hovered, handleClear]
  );

  return (
    <Wrapper data-testid="projects-creator-filter">
      <Typography size="body" otherProperties={{ flexShrink: 0 }}>
        {t("Created by:")}
      </Typography>
      <InputWrapper
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Popup
          trigger={
            <TextInput
              size="normal"
              extendWidth
              actions={actions}
              placeholder={t("Anyone")}
              value={query}
              onChange={handleQueryChange}
              ariaLabel={t("Created by")}
              dataTestid="projects-creator-filter-input"
            />
          }
          open={open}
          onOpenChange={handleOpenChange}
          placement="bottom-start"
          offset={4}
          extendTriggerWidth
          extendContentWidth
        >
          <DropDownList data-testid="projects-creator-filter-options">
            {filteredCreators.length === 0 ? (
              <DropDownItem>
                <Typography size="body" color={theme.content.weaker}>
                  {t("No members found")}
                </Typography>
              </DropDownItem>
            ) : (
              filteredCreators.map((creator) => (
                <DropDownItem
                  key={creator.id}
                  role="option"
                  aria-selected={creator.id === value}
                  isSelected={creator.id === value}
                  onClick={() => handleSelect(creator)}
                  data-testid={`projects-creator-filter-option-${creator.id}`}
                >
                  <EditorBadge
                    editor={creator}
                    textColor={theme.content.main}
                  />
                </DropDownItem>
              ))
            )}
          </DropDownList>
        </Popup>
      </InputWrapper>
    </Wrapper>
  );
};

export default CreatorFilter;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  flex: 1,
  maxWidth: 280
}));

const InputWrapper = styled("div")(() => ({
  flex: 1,
  minWidth: 0
}));

const DropDownList = styled("div")(({ theme }) => ({
  boxSizing: css.boxSizing.borderBox,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro,
  padding: theme.spacing.micro,
  maxHeight: 240,
  overflowY: "auto",
  backgroundColor: theme.bg[1],
  boxShadow: theme.shadow.popup,
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.outline.weaker}`,
  ...theme.scrollBar
}));

const DropDownItem = styled("div")<{ isSelected?: boolean }>(
  ({ isSelected, theme }) => ({
    display: css.display.flex,
    alignItems: css.alignItems.center,
    padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
    borderRadius: theme.radius.smallest,
    backgroundColor: isSelected ? theme.select.weak : theme.bg[1],
    cursor: css.cursor.pointer,
    ["&:hover"]: {
      backgroundColor: theme.bg[2]
    }
  })
);
