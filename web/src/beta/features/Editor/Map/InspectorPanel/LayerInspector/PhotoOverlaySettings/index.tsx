import { SwitchField } from "@reearth/beta/ui/fields";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { NLSPhotoOverlay } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

type Props = {
  selectedLayerId: string;
  photoOverlay?: NLSPhotoOverlay;
};

const PhotoOverlaySettings: FC<Props> = ({ selectedLayerId, photoOverlay }) => {
  const t = useT();

  const { visibleItems, handlePhotoOverlayCreate } = useHooks({
    layerId: selectedLayerId,
    property: photoOverlay?.property
  });

  return (
    <Wrapper>
      {visibleItems ? (
        visibleItems.map((i) => (
          <PropertyItem
            key={i.id ?? ""}
            propertyId={photoOverlay?.property?.id}
            item={i}
          />
        ))
      ) : (
        <SwitchField
          title={t("Enable PhotoOverlay")}
          description={t("Show photo overlay when the user clicks on a layer")}
          value={false}
          onChange={handlePhotoOverlayCreate}
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

export default PhotoOverlaySettings;
