import React, { useCallback, useState } from "react";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import SelectField from "@reearth/components/atoms/SelectBox";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export type PrimitiveItem = { name: string; extensionId: string; icon: string; pluginId: string };

export type Props = {
  primitiveItems?: PrimitiveItem[];
  onCreateLayerGroup?: (pluginId: string, extensionId: string) => void;
};

const DatasetPropertyItem: React.FC<Props> = ({ primitiveItems, onCreateLayerGroup }) => {
  const t = useT();
  const [selectedPrimitiveType, selectPrimitiveType] = useState("");

  const handlePrimitiveTypeChange = (type: string) => {
    if (primitiveItems?.map(p => p.extensionId).includes(type)) {
      selectPrimitiveType(type);
    }
  };

  const handleSubmit = useCallback(() => {
    const item = primitiveItems?.find(p => p.extensionId === selectedPrimitiveType);
    if (!item) return;
    onCreateLayerGroup?.(item?.pluginId, item?.extensionId);
  }, [onCreateLayerGroup, primitiveItems, selectedPrimitiveType]);

  const convertPrimitiveItemToDatasetPropertyItem = (
    items?: PrimitiveItem[],
  ): { key: string; label: string; icon: string }[] => {
    return items?.map(i => ({ key: i.extensionId, label: i.name, icon: i.icon })) || [];
  };
  return (
    <Flex direction="column">
      <Flex>
        <Flex flex={1}>
          <Text size="xs">{t("Layer style")}</Text>
        </Flex>
        <Flex flex={2}>
          <SelectField
            items={convertPrimitiveItemToDatasetPropertyItem(primitiveItems)}
            selected={selectedPrimitiveType}
            onChange={handlePrimitiveTypeChange}
          />
        </Flex>
      </Flex>
      <StyledButton
        type="button"
        text={t("import")}
        buttonType="primary"
        disabled={!selectedPrimitiveType}
        onClick={handleSubmit}
      />
    </Flex>
  );
};

const StyledButton = styled(Button)`
  width: 80px;
  margin-left: auto;
`;

export default DatasetPropertyItem;
