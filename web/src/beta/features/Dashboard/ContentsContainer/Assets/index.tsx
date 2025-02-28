import AssetsManager from "@reearth/beta/features/AssetsManager";
import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

const ASSETS_LAYOUT_STORAGE_KEY = `reearth-visualizer-dashboard-assets-layout`;

type Props = {
  workspaceId?: string;
};

const Assets: FC<Props> = ({ workspaceId }) => {
  const t = useT();
  const theme = useTheme();

  const [layout, setLayout] = useState(
    ["grid", "list"].includes(
      localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) ?? ""
    )
      ? (localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) as ManagerLayout)
      : "grid"
  );

  const handleLayoutChange = useCallback((newLayout?: ManagerLayout) => {
    if (!newLayout) return;
    localStorage.setItem(ASSETS_LAYOUT_STORAGE_KEY, newLayout);
    setLayout(newLayout);
  }, []);

  return (
    <Wrapper>
      <Warning>
        <WarningTitle>
          <Icon icon="warning" color={theme.warning.main} />
          <Typography size="h5" weight="bold" color={theme.warning.main}>
            {t("Important Changes")}
          </Typography>
        </WarningTitle>

        <Typography size="h5" color={theme.warning.main}>
          {t(
            "Due to functional requirements, we have modified the data structure of the Visualizer. Starting from this version, asset management will no longer be centralized under the workspace but will instead be handled on each project's Asset page. As a result, this page will be removed in the next version. To ensure the security of your project data, please complete the data migration in a timely manner by following the instructions on this page."
          )}
        </Typography>
      </Warning>
      <AssetsManager
        workspaceId={workspaceId}
        size="large"
        layout={layout}
        enableUpload={false}
        onLayoutChange={handleLayoutChange}
      />
    </Wrapper>
  );
};

const Wrapper = styled("div")(({theme}) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
  minWidth: "630px",
  ...theme.scrollBar,
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto"
  }
}));

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.large,
  gap: theme.spacing.large,
  border: `1px solid ${theme.warning.main}`,
  borderRadius: theme.radius.large,
  margin: theme.spacing.largest
}));

const WarningTitle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

export default Assets;
