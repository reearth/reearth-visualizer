import React from "react";
import { useIntl } from "react-intl";

// Theme
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

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
  const intl = useIntl();
  const text =
    status === "published" || status === "limited"
      ? intl.formatMessage({ defaultMessage: "Published" })
      : intl.formatMessage({ defaultMessage: "Unpublished" });

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
  background: ${props =>
    props.status === "published" || props.status === "limited"
      ? props.theme.publishStatus.published
      : props.status === "unpublished"
      ? props.theme.publishStatus.unpublished
      : props.status === "building"
      ? props.theme.publishStatus.building
      : null};
  border-radius: 50px;
  margin: auto ${metricsSizes["s"]}px auto 0;
`;

const PublishLink = styled.a`
  color: ${props => props.theme.main.strongText};
  text-decoration: none;
`;

export default PublicationStatus;
