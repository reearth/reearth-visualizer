import { useEffect, useState } from "react";

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

import { Tab } from "../../Navbar";

type Props = {
  propertyId: string;
  propertyItems?: Item[];
  currentCamera?: Camera;
  layers?: NLSLayer[];
  selectedPage?: Page;
  tab?: Tab;
  onFlyTo?: FlyTo;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

const Settings: React.FC<Props> = ({
  propertyId,
  propertyItems,
  currentCamera,
  layers,
  tab,
  selectedPage,
  onFlyTo,
  onPageUpdate,
}) => {
  const t = useT();
  const [layerChecked, setLayerChecked] = useState<string[]>([]);
  const [allLayersChecked, setAllLayersChecked] = useState(false);

  useEffect(() => {
    if (selectedPage && layers) {
      const selectedLayerIds = selectedPage.layersIds || [];
      setLayerChecked(selectedLayerIds);
    }
  }, [selectedPage, layers]);

  const pageId = selectedPage?.id;
  const handleLayerCheck = (layerId: string) => {
    if (!pageId) return;
    setLayerChecked(prev => {
      const updatedLayers = prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId];

      onPageUpdate?.(pageId, updatedLayers);
      const allLayersSelected = layers?.every(layer => updatedLayers.includes(layer.id));
      setAllLayersChecked(allLayersSelected);
      return updatedLayers ? updatedLayers : prev;
    });
  };

  const handleAllLayersCheck = () => {
    if (!pageId || !layers) return;
    if (allLayersChecked) {
      setLayerChecked([]);
    } else {
      const allLayerIds = layers.map(layer => layer.id);
      setLayerChecked(allLayerIds);
    }
    setAllLayersChecked(prev => !prev);
    onPageUpdate?.(pageId, allLayersChecked ? [] : layers.map(layer => layer.id));
  };

  return (
    <Wrapper>
      {tab == "story" && (
        <SidePanelSectionField title={t("Layers")}>
          <LayerWrapper>
            <AllLayers>
              <CheckBoxField
                label={t("All Layers")}
                onClick={handleAllLayersCheck}
                checked={allLayersChecked}
              />
            </AllLayers>
            {layers?.map((layer, idx) => (
              <Layer key={idx}>
                <CheckBoxField
                  onClick={() => handleLayerCheck(layer.id)}
                  checked={layerChecked.includes(layer.id)}
                  label={layer.title}
                />
              </Layer>
            ))}
          </LayerWrapper>
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

const LayerWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
`;

const Layer = styled.div`
  padding: 6px 4px;
`;

const AllLayers = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
  padding: 6px 4px;
`;
