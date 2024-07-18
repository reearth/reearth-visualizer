import { FC } from "react";

import { TextArea, TextInput } from "@reearth/beta/lib/reearth-ui";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { InputGroup, InputsWrapper } from "../../../SharedComponent";

type Props = {
  selectedLayer: NLSLayer;
};

const DataSource: FC<Props> = ({ selectedLayer }) => {
  const t = useT();
  return (
    <Wrapper>
      <InputGroup label={t("Layer Name")}>
        <InputsWrapper>
          <TextInput appearance="readonly" value={selectedLayer.title} disabled />
        </InputsWrapper>
      </InputGroup>
      <InputGroup label={t("Format")}>
        <InputsWrapper>
          <TextInput appearance="readonly" value={selectedLayer.config?.data?.type} disabled />
        </InputsWrapper>
      </InputGroup>

      {selectedLayer.config?.data?.url && (
        <InputGroup label={t("Resource URL")}>
          <InputsWrapper>
            <TextArea
              rows={3}
              value={selectedLayer.config?.data?.url}
              appearance="readonly"
              disabled
            />
          </InputsWrapper>
        </InputGroup>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

export default DataSource;
