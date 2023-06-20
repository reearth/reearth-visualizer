import React from "react";

import Text from "@reearth/classic/components/atoms/Text";
// Theme
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type Status = "published" | "limited" | "unpublished";

interface PublishStatusProps {
  className?: string;
  status?: Status;
  url?: string[];
  alias?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const PublicationStatus: React.FC<PublishStatusProps> = ({
  className,
  status,
  url,
  alias,
  size,
}) => {
  const t = useT();
  const text = status === "published" || status === "limited" ? t("Published") : t("Unpublished");

  return (
    <StyledStatus className={className}>
      <StatusCircle status={status} size={size} />
      <Text
        size={size === "lg" ? "m" : size === "md" ? "s" : "xs"}
        otherProperties={{ userSelect: "none" }}
        customColor>
        {status === "published" && alias ? (
          <PublishLink href={`${url?.[0] ?? ""}/${alias}${url?.[1]}`} target="blank">
            {status && text}
          </PublishLink>
        ) : (
          status && text
        )}
      </Text>
    </StyledStatus>
  );
};

const StyledStatus = styled.div`
  display: flex;
  align-items: center;
`;

const StatusCircle = styled.div<PublishStatusProps>`
  width: ${({ size }) => (size === "lg" || size === "md" ? "10px" : "9px")};
  height: ${({ size }) => (size === "lg" || size === "md" ? "10px" : "9px")};
  background: ${({ theme, status }) =>
    status === "published" || status === "limited"
      ? theme.classic.publishStatus.published
      : status === "unpublished"
      ? theme.classic.publishStatus.unpublished
      : status === "building"
      ? theme.classic.publishStatus.building
      : null};
  border-radius: 50px;
  margin: auto ${metricsSizes["s"]}px auto 0;
`;

const PublishLink = styled.a`
  color: ${({ theme }) => theme.classic.main.strongText};
  text-decoration: none;
`;

export default PublicationStatus;
