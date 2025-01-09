import { CheckBox, Typography } from "@reearth/beta/lib/reearth-ui";
import { Layer } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  selectedLayer: Layer | undefined;
  updateInfoboxEnabled: () => void;
};
const SettingsList: FC<Props> = ({ selectedLayer, updateInfoboxEnabled }) => {
  const selectedLayerInfoboxEnabled =
    selectedLayer?.infobox?.property?.default?.enabled?.value;

  return (
    <Wrapper>
      <Row>
        <CheckBox
          value={selectedLayerInfoboxEnabled}
          onChange={updateInfoboxEnabled}
        />
        <Typography size="body" otherProperties={{ paddingLeft: 4 }}>
          Enable Infobox
        </Typography>
      </Row>
      <Row>
        <CheckBox />
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
