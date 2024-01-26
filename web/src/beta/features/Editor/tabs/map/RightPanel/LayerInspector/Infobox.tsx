import { useMemo } from "react";

import NumberField from "@reearth/beta/components/fields/NumberField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import SpacingInput from "@reearth/beta/components/fields/SpacingInput";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  //   selectedLayer: NLSLayer;
  // position?: InfoboxPosition;
};

const Infobox: React.FC<Props> = () => {
  const t = useT();
  const positionOptions = useMemo(
    () => [
      { key: "left", label: t("Left") },
      { key: "right", label: t("Right") },
    ],
    [t],
  );

  return (
    <Wrapper>
      <ToggleField
        name={t("Enable Infobox")}
        description={t("Show infobox when the user clicks on a layer")}
        checked={true}
        onChange={() => console.log("trying to change the unchangeable")}
      />
      <SelectField
        name={t("Position")}
        description={t("Position of the infobox. Options are left or right")}
        value={"right"}
        options={positionOptions}
        onChange={() => console.log("trying to change the unchangeable")}
      />
      <SpacingInput name={t("Padding")} />
      <NumberField name={t("Gap")} suffix="px" />
    </Wrapper>
  );
};

export default Infobox;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
