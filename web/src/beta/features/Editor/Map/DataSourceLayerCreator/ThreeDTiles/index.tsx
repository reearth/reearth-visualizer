import { FC, useState } from "react";

import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper,
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import { Button, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";

import { DataProps } from "..";
import { generateTitle } from "../util";

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
      <ContentWrapper>
        <InputGroup label={t("Resource URL")}>
          <InputsWrapper>
            <TextInput placeholder="https://" value={value} onChange={value => setValue(value)} />
          </InputsWrapper>
        </InputGroup>
      </ContentWrapper>

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

export default ThreeDTiles;
