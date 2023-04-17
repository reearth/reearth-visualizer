import React from "react";

import Divider from "@reearth/components/atoms/Divider";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Slide from "@reearth/components/atoms/Slide";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import Header from "./Header";
import useHooks from "./hooks";
import List from "./List";
import type { DatasetSchema, Type } from "./types";

export type { DatasetSchema, Dataset, DatasetField, Type } from "./types";

export type Props = {
  className?: string;
  linkedDataset?: {
    schema: string;
    dataset?: string;
    field: string;
    schemaName?: string;
    datasetName?: string;
    fieldName?: string;
  };
  isOverridden?: boolean;
  isLinkable?: boolean;
  isLinked?: boolean;
  isTemplate?: boolean;
  linkedFieldName?: string;
  fixedDatasetSchemaId?: string;
  fixedDatasetId?: string;
  linkableType?: Type;
  datasetSchemas?: DatasetSchema[];
  onDatasetPickerOpen?: () => void;
  onClear?: () => void;
  onLink?: (datasetSchemaId: string, datasetId: string | undefined, fieldId: string) => void;
};

const PropertyLinkPanel: React.FC<Props> = ({
  className,
  linkedDataset,
  isLinkable,
  isLinked,
  isTemplate,
  linkedFieldName,
  isOverridden,
  fixedDatasetSchemaId,
  fixedDatasetId,
  linkableType,
  datasetSchemas,
  onLink,
  onDatasetPickerOpen,
  onClear,
}) => {
  const t = useT();
  const {
    selected,
    pos,
    startDatasetSelection,
    finishDatasetSelection,
    proceed,
    back,
    visibleDatasetSchemas,
    selectedSchema,
    selectedDatasetPath,
    clear,
  } = useHooks({
    onDatasetPickerOpen,
    linkedDataset,
    onLink,
    onClear,
    linkableType,
    datasetSchemas,
    fixedDatasetSchemaId,
    fixedDatasetId,
    isLinkable,
  });
  const theme = useTheme();

  return (
    <Wrapper className={className}>
      <Slide pos={pos}>
        <FirstSlidePage>
          {!isOverridden && isLinkable && (
            <>
              <Link align="center" justify="space-between" onClick={startDatasetSelection}>
                <Text size="xs" color={theme.main.link}>
                  {linkedDataset ? t("Linkable data") : t("Link to dataset")}
                </Text>
                <Icon icon="arrowRight" size={16} color={theme.main.link} />
              </Link>
              <Divider margin="0" />
            </>
          )}
          {!isLinkable && ((!isOverridden && !isLinked) || (!linkedDataset && isTemplate)) && (
            <Text
              size="xs"
              color={theme.main.weak}
              otherProperties={{ padding: `${metricsSizes["s"]}px` }}>
              {t("No linked data")}
            </Text>
          )}
          {!isLinkable && isLinked && !isOverridden && !isTemplate && (
            <Text
              size="xs"
              color={theme.main.strongText}
              otherProperties={{ padding: `${metricsSizes["s"]}px 0 0 ${metricsSizes["s"]}px` }}>
              {t("From")}
            </Text>
          )}
          <LinkedData>
            {!isLinkable && linkedFieldName ? (
              <LinkedDataDetailContent>
                {isOverridden && (
                  <Text size="xs" color={theme.main.warning}>
                    {t("Overridden")}
                  </Text>
                )}
                {((isLinked && !linkedDataset && !isTemplate) || isOverridden) && (
                  <Text size="xs" color={isOverridden ? theme.main.weak : theme.main.link}>
                    {t("Parent.")}
                    {linkedFieldName}
                  </Text>
                )}
                {isLinked && !isOverridden && selectedDatasetPath && (
                  <>
                    <Text
                      size="xs"
                      color={isOverridden ? theme.main.weak : theme.main.link}
                      otherProperties={{
                        textDecoration: "underline",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {selectedDatasetPath.join("/")}
                    </Text>
                    <Text size="xs" color={isOverridden ? theme.main.weak : theme.main.link}>
                      {selectedDatasetPath[selectedDatasetPath.length - 1]}
                    </Text>
                  </>
                )}
              </LinkedDataDetailContent>
            ) : null}
          </LinkedData>
          <Divider margin="0" />
          <Link align="center" justify="space-between" onClick={clear}>
            <Text size="xs" color={theme.main.danger}>
              {isOverridden ? t("Reset this field") : t("Clear this field")}
            </Text>
            <Icon icon="fieldClear" size={16} color={theme.main.danger} />
          </Link>
        </FirstSlidePage>
        {!fixedDatasetSchemaId && (
          <SlidePage>
            <Header title="" onBack={back} />
            <List
              items={visibleDatasetSchemas}
              onSelect={id => proceed({ schema: id })}
              selectedItem={selected.schema}
            />
          </SlidePage>
        )}
        <SlidePage>
          <Header title="" onBack={back} />
          <List
            items={selectedSchema?.fields}
            selectableType={linkableType}
            onSelect={id => finishDatasetSelection(id)}
            selectedItem={selected.field}
          />
        </SlidePage>
      </Slide>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background-color: ${({ theme }) => theme.main.lighterBg};
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  width: 200px;
  height: 200px;
  z-index: ${props => props.theme.zIndexes.propertyFieldPopup};
`;

const SlidePage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FirstSlidePage = styled(SlidePage)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const LinkedData = styled.div`
  padding: 7px 10px;
  flex: auto;
`;

const LinkedDataDetailContent = styled.div`
  width: 135px;
  * {
    margin: 4px 0;
  }
`;

const Link = styled(Flex)`
  cursor: pointer;
  user-select: none;
  padding: ${metricsSizes["s"]}px;
`;

export default PropertyLinkPanel;
