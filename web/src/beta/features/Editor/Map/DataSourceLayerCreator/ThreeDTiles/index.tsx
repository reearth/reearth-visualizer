import { FC, useState } from "react";

import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
} from "@reearth/beta/features/Editor/Map/commonLayerCreatorStyles";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { generateTitle } from "@reearth/beta/utils/generate-title";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { DataProps } from "..";

const ThreeDTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value),
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : undefined,
          type: "3dtiles",
        },
      },
    });
    onClose();
  };

  return (
    <Wrapper>
      <InputGroup label={t("Resource URL")}>
        <InputsWrapper>
          <TextInput placeholder="https://" value={value} onChange={value => setValue(value)} />
        </InputsWrapper>
      </InputGroup>
      <Spacer />
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

const Spacer = styled("div")(() => ({
  minHeight: "100px",
}));

export default ThreeDTiles;
