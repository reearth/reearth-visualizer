import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../Button";
import { Typography } from "../Typography";

export const NotFound: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const theme = useTheme();
  const t = useT();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/dashboard/${workspaceId}/`);
  }, [navigate, workspaceId]);

  return (
    <Wrapper>
      <Typography size="body" weight="bold" color={theme.dangerous.strong}>
        {t("Re:Earth Visualizer")}
      </Typography>
      <EmptyContent>
        <Typography size="h1" color={theme.content.main}>
          404
        </Typography>
        <Typography size="body" color={theme.content.main}>
          {t("Oops, This Page Not Found!")}
        </Typography>
        <Button
          appearance="primary"
          title={t("Go to Dashboard")}
          onClick={handleClick}
        />
      </EmptyContent>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  padding: theme.spacing.small
}));

const EmptyContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.normal,
  margin: "auto"
}));
