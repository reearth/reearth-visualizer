import PropertyItem from "@reearth/beta/components/fields/Property/PropertyItem";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import { NLSInfobox } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  selectedLayerId: string;
  infobox?: NLSInfobox;
};

const Infobox: React.FC<Props> = ({ selectedLayerId, infobox }) => {
  const t = useT();

  const { visibleItems, handleInfoboxCreate } = useHooks({
    layerId: selectedLayerId,
    property: infobox?.property,
  });

  return (
    <Wrapper>
      {visibleItems ? (
        visibleItems.map(i => (
          <PropertyItem key={i.id} propertyId={infobox?.property?.id} item={i} />
        ))
      ) : (
        <ToggleField
          name={t("Enable Infobox")}
          description={t("Show infobox when the user clicks on a layer")}
          checked={false}
          onChange={handleInfoboxCreate}
        />
      )}
    </Wrapper>
  );
};

export default Infobox;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
