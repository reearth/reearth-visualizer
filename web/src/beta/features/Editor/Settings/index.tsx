import { useState } from "react";

import CheckBoxField from "@reearth/beta/components/CheckboxField";
import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  currentCamera?: Camera;
  layers?: NLSLayer[];
  selectedPage?: Page;
  hasStory?: boolean;
  onFlyTo?: FlyTo;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

const Settings: React.FC<Props> = ({
  propertyId,
  propertyItems,
  currentCamera,
  layers,
  selectedPage,
  hasStory,
  onFlyTo,
  onPageUpdate,
}) => {
  const t = useT();
  const [layerChecked, setLayerChecked] = useState<string[]>([]);

  // const filterLayers = layers?.filter(item => selectedPage?.layersIds?.includes(item.id));

  const pageId = selectedPage?.id;
  const handleLayerCheck = (layerId: string) => {
    setLayerChecked(prev => {
      const exist = prev.includes(layerId);
      if (!exist) {
        const updatedLayers = [...prev, layerId];
        pageId && onPageUpdate?.(pageId, updatedLayers);
        return updatedLayers;
      } else {
        return prev.filter(id => id !== layerId);
      }
    });
  };

  return (
    <Wrapper>
      {hasStory && (
        <SidePanelSectionField title={t("Layers")}>
          {layers?.map((layer, idx) => (
            <Layer key={idx}>
              <CheckBoxField
                onClick={() => handleLayerCheck(layer.id)}
                checked={layerChecked.includes(layer.id)}
                label={layer.title}
              />
            </Layer>
          ))}
        </SidePanelSectionField>
      )}
      {propertyItems?.map((i, idx) => (
        <SidePanelSectionField title={i.title ?? "Undefined"} key={idx}>
          <FieldComponents
            propertyId={propertyId}
            item={i}
            currentCamera={currentCamera}
            onFlyTo={onFlyTo}
          />
        </SidePanelSectionField>
      ))}
    </Wrapper>
  );
};

export default Settings;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  padding: 8px;
  background: ${({ theme }) => theme.bg[1]};
  border-radius: 4px;
`;

const Layer = styled.div`
  padding: 4px;
`;
