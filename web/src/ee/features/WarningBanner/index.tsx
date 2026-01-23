import { Typography } from "@reearth/app/lib/reearth-ui";
import { useWorkspacePolicyCheck } from "@reearth/services/api/workspace";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

type WarningBannerProps = {
  workspaceId?: string;
};

const WarningBanner: FC<WarningBannerProps> = ({ workspaceId }) => {
  const policyCheckResult = useWorkspacePolicyCheck(workspaceId ?? "");
  const t = useT();

  const info = useMemo(() => {
    if (
      policyCheckResult?.workspacePolicyCheck?.disableOperationByOverUsedSeat
    ) {
      return {
        title: t("Member Limit Exceeded"),
        message: t(
          "This workspace has exceeded the member limit for its current plan. Editing is temporarily disabled for all members. Please ask the workspace owner to remove extra members or upgrade the plan to restore access."
        )
      };
    }

    return null;
  }, [policyCheckResult, t]);

  return info ? (
    <Wrapper>
      <Typography size="body" weight="bold">
        {info.title}
      </Typography>
      <Typography size="body">{info.message}</Typography>
    </Wrapper>
  ) : null;
};

export default WarningBanner;

const Wrapper = styled("div")(({ theme }) => ({
  background: theme.dangerous.main,
  color: theme.content.main,
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));
