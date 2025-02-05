import {  TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { FC } from "react";

import {
  ContentWrapper,
  InputGroup,
  InputsWrapper,
  Wrapper
} from "../../shared/SharedComponent";

export interface Props {
  layerName?: string;
  onLayerNameChange?: (value?: string) => void;
}
const General: FC<Props> = ({
  layerName,
  onLayerNameChange,
}) => {
  const t = useT();

  return (
    <Wrapper>
      <ContentWrapper>
        <InputGroup label={t("Layer Name")}>
          <InputsWrapper>
            <TextInput
              placeholder={t(" Text")}
              value={layerName}
              onChange={onLayerNameChange}
            />
          </InputsWrapper>
        </InputGroup>
      </ContentWrapper>
    </Wrapper>
  );
};

export default General;
