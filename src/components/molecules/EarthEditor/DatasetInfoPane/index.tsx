import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import TabCard from "@reearth/components/atoms/TabCard";
import Table from "@reearth/components/atoms/Table";
import { useTheme } from "@reearth/theme";

import DatasetPropertyItem, {
  PrimitiveItem as PrimitiveItemType,
} from "./DatasetProperty/PropertyItem";

export type PrimitiveItem = PrimitiveItemType;

export type Props = {
  className?: string;
  datasets?: { [key: string]: string }[];
  datasetHeaders?: string[];
  primitiveItems?: PrimitiveItem[];
  onCreateLayerGroup?: (pluginId: string, extensionId: string) => void;
};

const DatasetInfoPane: React.FC<Props> = ({
  datasetHeaders,
  datasets,
  primitiveItems,
  onCreateLayerGroup,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  return (
    <Flex direction="column">
      <TabCard name={intl.formatMessage({ defaultMessage: "Data" })}>
        <Flex direction="column">
          {/* <Box mv="l">
            <Text size="xs">from PC file</Text>
          </Box> */}
          <Table
            headers={datasetHeaders}
            items={datasets}
            bg={theme.properties.bg}
            borderColor={theme.properties.border}
            textSize="xs"
          />
          {/* <Button
            type="button"
            text={intl.formatMessage({ defaultMessage: "Update" })}
            buttonType="secondary"
            icon="update"
            onClick={onDatasetUpdate}
          /> */}
        </Flex>
      </TabCard>
      <TabCard name={intl.formatMessage({ defaultMessage: "Import to scene" })}>
        <DatasetPropertyItem
          primitiveItems={primitiveItems}
          onCreateLayerGroup={onCreateLayerGroup}
        />
      </TabCard>
    </Flex>
  );
};

export default DatasetInfoPane;
