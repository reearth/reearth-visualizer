import { CheckBox, Typography } from "@reearth/app/lib/reearth-ui";
import { SelectField } from "@reearth/app/ui/fields";
import { useT, SUPPORTED_LANGUAGES } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

type Props = {
  changeLanguage: (lang: string) => void;
  infoboxEnabled: boolean;
  lang: string;
  setInfoboxEnabled: (infoBoxEnabled: boolean) => void;
  setShowStoryPanel: (showStoryPanel: boolean) => void;
  showStoryPanel: boolean;
};
const Settings: FC<Props> = ({
  changeLanguage,
  infoboxEnabled,
  lang,
  setInfoboxEnabled,
  setShowStoryPanel,
  showStoryPanel
}) => {
  const t = useT();

  const options = useMemo(() => Object.values(SUPPORTED_LANGUAGES), []);

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
        <div>
          <CheckBox
            value={showStoryPanel}
            onChange={(value) => setShowStoryPanel(value)}
          />
        </div>
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          {t("Show Story Panel")}
        </Typography>
      </Row>
      <SelectorWrapper>
        <SelectField
          title={t("UI Language")}
          value={lang}
          options={options}
          onChange={(value) => changeLanguage(value as string)}
        />
      </SelectorWrapper>
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

const SelectorWrapper = styled.div(({ theme }) => ({
  display: "flex",
  padding: theme.spacing.smallest
}));

export default Settings;
