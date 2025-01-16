import { CheckBox, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  infoboxEnabled: boolean;
  setInfoboxEnabled: (infoBoxEnabled: boolean) => void;
  setShowStoryPanel: (showStoryPanel: boolean) => void;
  showStoryPanel: boolean;
};
const SettingsList: FC<Props> = ({
  infoboxEnabled,
  setInfoboxEnabled,
  setShowStoryPanel,
  showStoryPanel
}) => {
  return (
    <Wrapper>
      <Row>
        <CheckBox
          value={infoboxEnabled}
          onChange={() => setInfoboxEnabled(!infoboxEnabled)}
        />
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          Enable Infobox
        </Typography>
      </Row>
      <Row>
        <CheckBox
          value={showStoryPanel}
          onChange={() => setShowStoryPanel(!showStoryPanel)}
        />
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          Enable Story Panel
        </Typography>
      </Row>
    </Wrapper>
  );
};

const Wrapper = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
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

export default SettingsList;
