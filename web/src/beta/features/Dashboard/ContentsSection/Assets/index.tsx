import { FC } from "react";

import { Button, Selector, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

const options = [
  { value: "latestModified", label: "Latest modified" },
  { value: "date", label: "Date" },
];

export type Props = {
  workspaceId?: string;
  viewState?: string;
  onChangeView?: (v?: string) => void;
};

export const Assets: FC<Props> = ({ viewState, onChangeView }) => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <Header>
        <Button title={t("Upload File")} icon="uploadSimple" />
        <Actions>
          <Typography size="body">{t("Sort:")}</Typography>
          <Selector options={options} />
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
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  gap: theme.spacing.large,
}));

const Header = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));
