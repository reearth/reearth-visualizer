import { FC } from "react";

import { Button, IconName, Selector, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type HeaderProp = {
  viewState: string;
  title: string;
  icon?: IconName;
  options?: { value: string; label?: string }[];
  appearance?: "primary" | "secondary" | "dangerous" | "simple";
  onClick: () => void;
  onChangeView?: (v?: string) => void;
  onSortChange?: (value?: string | string[]) => void;
};
export const CommonHeader: FC<HeaderProp> = ({
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

  return (
    <Header>
      <Button title={title} icon={icon} appearance={appearance} onClick={onClick} />

      <Actions>
        <Typography size="body">{t("Sort:")}</Typography>
        <Selector options={options || []} onChange={onSortChange} />
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
          onClick={() => onChangeView?.("list")}
        />
      </Actions>
    </Header>
  );
};

const Header = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));
