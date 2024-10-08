import { InputField, TextareaField } from "@reearth/beta/ui/fields";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  selectedLayer: NLSLayer;
};

const DataSource: FC<Props> = ({ selectedLayer }) => {
  const t = useT();
  return (
    <Wrapper>
      <InputField
        title={t("Layer Name")}
        value={selectedLayer.title}
        appearance="readonly"
        disabled
      />
      <InputField
        title={t("Format")}
        value={selectedLayer.config?.data?.type}
        appearance="readonly"
        disabled
      />

      {selectedLayer.config?.data?.url && (
        <TextareaField
          title={t("Resource URL")}
          value={selectedLayer.config?.data?.url}
          appearance="readonly"
          disabled
          rows={3}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

export default DataSource;
