import { SwitchField } from "@reearth/app/ui/fields";
import PropertyItem from "@reearth/app/ui/fields/Properties";
import { NLSInfobox } from "@reearth/services/api/layer/types";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

type Props = {
  selectedLayerId: string;
  infobox?: NLSInfobox;
};

const Infobox: FC<Props> = ({ selectedLayerId, infobox }) => {
  const t = useT();

  const { visibleItems, handleInfoboxCreate } = useHooks({
    layerId: selectedLayerId,
    property: infobox?.property
  });

  return (
    <Wrapper>
      {visibleItems ? (
        visibleItems.map((i) =>
          infobox?.property?.id ? (
            <PropertyItem
              key={i.id ?? ""}
              propertyId={infobox.property.id}
              item={i}
            />
          ) : null
        )
      ) : (
        <SwitchField
          title={t("Enable Infobox")}
          description={t("Show infobox when the user clicks on a layer")}
          value={false}
          onChange={handleInfoboxCreate}
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

export default Infobox;
