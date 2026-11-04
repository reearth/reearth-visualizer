import { InputGroup } from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import { Icon, TextInput } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

type Props = {
  latColumn: string;
  lngColumn: string;
  onLatColumnChange: (value: string) => void;
  onLngColumnChange: (value: string) => void;
  // Prefix for the inputs' test ids, e.g. "url-layer-creator".
  testIdPrefix: string;
};

const CsvColumnInputs: FC<Props> = ({
  latColumn,
  lngColumn,
  onLatColumnChange,
  onLngColumnChange,
  testIdPrefix
}) => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <InputGroup label={t("Latitude Column Name")}>
        <TextInput
          extendWidth
          value={latColumn}
          placeholder={t("Column name")}
          onChange={onLatColumnChange}
          dataTestid={`${testIdPrefix}-lat`}
        />
      </InputGroup>
      <InputGroup label={t("Longitude Column Name")}>
        <TextInput
          extendWidth
          value={lngColumn}
          placeholder={t("Column name")}
          onChange={onLngColumnChange}
          dataTestid={`${testIdPrefix}-lng`}
        />
      </InputGroup>
      <Note>
        <Icon icon="lightBulb" color={theme.warning.main} size="normal" />
        {t(
          "Visualizer currently only supports CSV point data. Please specify the column names for latitude and longitude in your data below."
        )}
      </Note>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large
}));

const Note = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  color: theme.warning.main,
  fontSize: theme.fonts.sizes.body,
  ["& > svg"]: { flexShrink: 0 }
}));

export default CsvColumnInputs;
