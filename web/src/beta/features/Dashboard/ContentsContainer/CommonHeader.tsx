import { FC, useCallback } from "react";

import { Button, IconName, Selector, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type HeaderProps = {
  viewState: string;
  title: string;
  icon?: IconName;
  options?: { value: string; label?: string }[];
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  onClick: () => void;
  onChangeView?: (v?: string) => void;
  onSortChange?: (value?: string) => void;
};

const CommonHeader: FC<HeaderProps> = ({
  title,
  icon,
  viewState,
  options,
  appearance,
  onClick,
  onChangeView,
  onSortChange,
}) => {
  const theme = useTheme();
  const t = useT();

  const onChange = useCallback(
    (value: string | string[]) => {
      onSortChange?.(value as string);
    },
    [onSortChange],
  );

  return (
    <Header>
      <ButtonWrapper>
        <Button title={title} icon={icon} appearance={appearance} onClick={onClick} />
      </ButtonWrapper>

      <Actions>
        <Typography size="body">{t("Sort")}: </Typography>
        <SelectorWrapper>
          <Selector options={options || []} onChange={onChange} />
        </SelectorWrapper>
        <Button
          iconButton
          icon="grid"
          iconColor={viewState === "grid" ? theme.content.main : theme.content.weak}
          appearance="simple"
          onClick={() => onChangeView?.("grid")}
        />
        <Button
          iconButton
          icon="list"
          iconColor={viewState === "list" ? theme.content.main : theme.content.weak}
          appearance="simple"
          disabled={icon === "uploadSimple" ? true : false}
          onClick={() => onChangeView?.("list")}
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
  flex: 1,
}));

const ButtonWrapper = styled("div")(() => ({
  flex: 3,
}));

const SelectorWrapper = styled("div")(() => ({
  flex: 1,
}));
