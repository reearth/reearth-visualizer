import AssetsManager from "@reearth/beta/features/AssetsManager";
import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";
import { Trans } from "react-i18next";

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
        <WarningContent size="h5" color={theme.warning.main}>
          <Trans i18nKey={"dashboard.assets.migration.warning"}>
            Based on functional requirements, we have decided to adjust the
            project structure. The asset management page, which was originally
            part of the workspace, will be moved to individual project pages. In
            other words, assets will now be managed under each project, making
            it more convenient for users to import and export them. As a result,
            the current page will no longer exist and will be removed in the
            next version. For more details, please refer to
            <a
              href="https://help.reearth.io/Assets-UI-Project-Setting-1b616e0fb1658099af90fb1ecc495a80"
              target="_blank"
            >
              this page
            </a>
            .
          </Trans>
        </WarningContent>
      </Warning>
      <ContentWrapper>
        <AssetsManager
          workspaceId={workspaceId}
          size="large"
          layout={layout}
          additionalFilter={(a) => !a.projectId}
          enableUpload={false}
          onLayoutChange={handleLayoutChange}
        />
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
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

const WarningContent = styled(Typography)(() => ({
  "& a": {
    textDecoration: "underline"
  }
}));

const ContentWrapper = styled("div")(() => ({
  minHeight: 0
}));

export default Assets;
