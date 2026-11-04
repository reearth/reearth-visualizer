import {
  Button,
  Icon,
  IconButton,
  IconName,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { keyframes, styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";
import { ClipLoader } from "react-spinners";

import { Upload } from "./useUploads";
import { AssetFormat, formatOf } from "./utils";

const FORMAT_ICON: Record<AssetFormat, IconName> = {
  geojson: "fileGeoJSON",
  csv: "fileCSV",
  kml: "fileKml",
  czml: "fileCzml"
};

type Props = {
  uploads: Upload[];
  uploading: boolean;
  onRemove: (id: string) => void;
  onSubmit: () => void;
};

// The files being uploaded, each with its progress, result or error.
const UploadList: FC<Props> = ({ uploads, uploading, onRemove, onSubmit }) => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper data-testid="asset-layer-creator-uploads">
      {uploads.map((u) => {
        const format = formatOf(u.file.name);
        return (
          <Item key={u.id}>
            <Row>
              <Icon icon={format ? FORMAT_ICON[format] : "file"} size="large" />
              <Name size="body">{u.file.name}</Name>
              {u.status === "uploading" ? (
                <ClipLoader size={12} color={theme.content.weak} />
              ) : u.status === "done" ? (
                <Icon icon="checkmarkCircle" color={theme.content.weak} />
              ) : (
                <Icon icon="warning" color={theme.content.weak} />
              )}
              <IconButton
                icon="close"
                appearance="simple"
                size="small"
                onClick={() => onRemove(u.id)}
                ariaLabel={t("Remove")}
              />
            </Row>
            <Bar status={u.status} />
            {u.error && (
              <Typography size="footnote" color={theme.dangerous.main}>
                {u.error}
              </Typography>
            )}
          </Item>
        );
      })}
      {!uploading && uploads.some((u) => u.status === "done") && (
        <Submit>
          <Button
            appearance="primary"
            title={t("Submit")}
            onClick={onSubmit}
            data-testid="asset-layer-creator-upload-submit"
          />
        </Submit>
      )}
    </Wrapper>
  );
};

// The upload request reports no progress, so an indeterminate bar slides
// while uploading.
const slide = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
`;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  width: 300
}));

const Item = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const Name = styled(Typography)(() => ({
  flex: 1,
  minWidth: 0,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  whiteSpace: css.whiteSpace.nowrap
}));

const Bar = styled("div", {
  shouldForwardProp: (prop) => prop !== "status"
})<{ status: Upload["status"] }>(({ theme, status }) => ({
  position: css.position.relative,
  height: 3,
  borderRadius: 2,
  overflow: css.overflow.hidden,
  background:
    status === "done"
      ? theme.select.main
      : status === "error"
        ? theme.dangerous.main
        : theme.content.weaker,
  ...(status === "uploading" && {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      width: "40%",
      background: theme.select.main,
      animation: `${slide} 1.2s ease-in-out infinite`
    }
  })
}));

const Submit = styled("div")(() => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.center
}));

export default UploadList;
