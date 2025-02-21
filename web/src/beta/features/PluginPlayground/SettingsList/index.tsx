import { CheckBox, Typography } from "@reearth/beta/lib/reearth-ui";
import { SelectField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  changeLanguage: (lang: string) => void;
  infoboxEnabled: boolean;
  lang: string;
  setInfoboxEnabled: (infoBoxEnabled: boolean) => void;
  setShowStoryPanel: (showStoryPanel: boolean) => void;
  showStoryPanel: boolean;
};
const SettingsList: FC<Props> = ({
  changeLanguage,
  infoboxEnabled,
  lang,
  setInfoboxEnabled,
  setShowStoryPanel,
  showStoryPanel
}) => {
  const t = useT();
  const options = [
    {
      label: t("Default"),
      value: "default"
    },
    {
      label: "English",
      value: "en"
    },
    {
      label: "日本語",
      value: "ja"
    }
  ];

  return (
    <Wrapper>
      <Row>
        <CheckBox
          value={infoboxEnabled}
          onChange={() => setInfoboxEnabled(!infoboxEnabled)}
        />
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          {t("Enable Infobox")}
        </Typography>
      </Row>
      <Row>
        <CheckBox
          value={showStoryPanel}
          onChange={(value) => setShowStoryPanel(value)}
        />
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          {t("Show Story Panel")}
        </Typography>
      </Row>
      <Row>
        <SelectorWrapper>
          <SelectField
            title={t("UI Language")}
            value={lang}
            options={options}
            onChange={(value) => changeLanguage(value as string)}
          />
        </SelectorWrapper>
      </Row>
    </Wrapper>
  );
};

const Wrapper = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  gap: theme.spacing.small,
  padding: theme.spacing.smallest
}));

const Row = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing.smallest,
  "&:hover": {
    backgroundColor: theme.bg[1]
  },
  borderRadius: theme.radius.small,
  minHeight: 28
}));

const SelectorWrapper = styled.div(() => ({
  width: "100%"
}));

export default SettingsList;
