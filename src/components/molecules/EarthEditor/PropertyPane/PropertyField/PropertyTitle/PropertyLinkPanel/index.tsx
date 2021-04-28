import React from "react";
import { useIntl } from "react-intl";

import { styled, useTheme } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import Slide from "@reearth/components/atoms/Slide";
import Icon from "@reearth/components/atoms/Icon";
import List from "./List";
import Header from "./Header";
import useHooks from "./hooks";
import { DatasetSchema, Type } from "./types";
import Text from "@reearth/components/atoms/Text";

export { DatasetSchema, Dataset, DatasetField, Type } from "./types";

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
  isDatasetLinkable?: boolean;
  fixedDatasetSchemaId?: string;
  fixedDatasetId?: string;
  linkDisabled?: boolean;
  linkableType?: Type;
  datasetSchemas?: DatasetSchema[];
  onDatasetPickerOpen?: () => void;
  onClear?: () => void;
  onUnlink?: () => void;
  onLink?: (datasetSchemaId: string, datasetId: string | undefined, fieldId: string) => void;
};

const PropertyLinkPanel: React.FC<Props> = ({
  className,
  linkedDataset,
  isOverridden,
  isDatasetLinkable,
  fixedDatasetSchemaId,
  fixedDatasetId,
  linkDisabled,
  linkableType,
  datasetSchemas,
  onLink,
  onUnlink,
  onDatasetPickerOpen,
  onClear,
}) => {
  const intl = useIntl();
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
    unlink,
  } = useHooks({
    onDatasetPickerOpen,
    linkedDataset,
    onLink,
    onUnlink,
    onClear,
    linkableType,
    datasetSchemas,
    fixedDatasetSchemaId,
    fixedDatasetId,
    isDatasetLinkable,
  });
  const theme = useTheme();

  return (
    <Wrapper size="xs" color={theme.main.text} className={className}>
      <Slide pos={pos}>
        <FirstSlidePage>
          <LinkedData>
            <LinkedDataHeader>
              {intl.formatMessage({ defaultMessage: "Linked Dataset" })}
            </LinkedDataHeader>
            <LinkedDataDetail size="2xs" color={theme.main.strongText}>
              {selectedDatasetPath?.length ? (
                <>
                  <LinkedDataDetailContent>
                    <div>{selectedDatasetPath[selectedDatasetPath.length - 1]}</div>
                    {selectedDatasetPath && (
                      <DataPath isOverridden={isOverridden}>
                        {selectedDatasetPath.join(" / ")}
                      </DataPath>
                    )}
                    {isOverridden && (
                      <DataHint>{intl.formatMessage({ defaultMessage: "Overridden" })}</DataHint>
                    )}
                  </LinkedDataDetailContent>
                  <StyledIcon icon="link" size={15} />
                </>
              ) : (
                <div>
                  {linkDisabled
                    ? intl.formatMessage({
                        defaultMessage: "This field cannot be linked to any dataset",
                      })
                    : intl.formatMessage({ defaultMessage: "No linked dataset" })}
                </div>
              )}
            </LinkedDataDetail>
          </LinkedData>
          {!linkDisabled && (
            <Link color={!linkedDataset ? "linked" : undefined} onClick={startDatasetSelection}>
              <div>
                {linkedDataset
                  ? intl.formatMessage({ defaultMessage: "Link to other datasets" })
                  : intl.formatMessage({ defaultMessage: "Link to datasets" })}
              </div>
              <StyledIcon icon="arrowRight" size={15} />
            </Link>
          )}
          {linkedDataset && (
            <Link onClick={unlink}>
              <div>{intl.formatMessage({ defaultMessage: "Unlink the dataset" })}</div>
              <StyledIcon icon="cancel" size={15} />
            </Link>
          )}
          <Link onClick={clear} color="overridden">
            <div>
              {isOverridden
                ? intl.formatMessage({ defaultMessage: "Reset this field" })
                : intl.formatMessage({ defaultMessage: "Clear this field" })}
            </div>
            <StyledIcon icon="cancel" size={15} />
          </Link>
        </FirstSlidePage>
        {!fixedDatasetSchemaId && (
          <SlidePage>
            <Header title="" onBack={back} />
            <List
              items={visibleDatasetSchemas}
              showArrows
              onSelect={id => proceed({ schema: id })}
              selectedItem={selected.schema}
            />
          </SlidePage>
        )}
        {isDatasetLinkable && (
          <SlidePage>
            <Header title="" onBack={back} />
            <List
              items={selectedSchema?.datasets}
              showArrows
              onSelect={id => proceed({ dataset: id })}
              selectedItem={selected.dataset}
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

const Wrapper = styled(Text)`
  background-color: #2b2a2f;
  border-radius: 5px;
  border: 1px solid #414141;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  width: 200px;
  height: 200px;
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

const LinkedDataHeader = styled.div`
  font-weight: bold;
  padding-bottom: 10px;
  color: #fff;
`;

const LinkedDataDetail = styled(Text)`
  display: flex;
  padding: 12px 0;
  justify-content: flex-start;
  align-items: center;
`;

const LinkedDataDetailContent = styled.div`
  flex: auto;
`;

const DataPath = styled.div<{ isOverridden?: boolean }>`
  color: ${({ isOverridden }) => (isOverridden ? "#FF3C53" : "#00a0e8")};
  text-decoration: underline;
  font-size: 6px;
`;

const DataHint = styled.div`
  font-size: 6px;
`;

const Link = styled.div<{ color?: "linked" | "overridden" }>`
  display: flex;
  cursor: pointer;
  user-select: none;
  padding: 10px;
  color: ${({ color }) =>
    color === "linked" ? colors.primary.main : color === "overridden" ? colors.danger.main : null};
  border-top: 1px solid #3a3a3a;
`;

const StyledIcon = styled(Icon)`
  margin-left: auto;
`;

export default PropertyLinkPanel;
