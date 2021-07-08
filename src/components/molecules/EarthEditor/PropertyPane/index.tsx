import React from "react";

import Wrapper from "@reearth/components/atoms/PropertyPane";
import GroupWrapper from "@reearth/components/atoms/PropertyGroup";
import Text from "@reearth/components/atoms/Text";
import Button from "@reearth/components/atoms/Button";
import { partitionObject } from "@reearth/util/util";
import { ExtendedFuncProps } from "@reearth/types";
import { useBind } from "@reearth/util/use-bind";
import PropertyItem, {
  Props as PropertyItemProps,
  Item as ItemItem,
  SchemaField as ItemSchemaField,
  Field as ItemField,
  Group as ItemGroup,
  GroupList as ItemGroupList,
  GroupListItem as ItemGroupListItem,
  ValueType as ItemValueType,
  ValueTypes as ItemValueTypes,
  Dataset as ItemDataset,
  DatasetSchema as ItemDatasetSchema,
  DatasetField as ItemDatasetField,
  DatasetType as ItemDatasetType,
  Layer as LayerType,
  Asset as AssetType,
  Mode as ModeType,
} from "./PropertyItem";
import WidgetToggleButton from "./WidgetToggleSwitch";
import { styled, useTheme } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Item = ItemItem;
export type SchemaField = ItemSchemaField;
export type Field = ItemField;
export type Group = ItemGroup;
export type GroupList = ItemGroupList;
export type GroupListItem = ItemGroupListItem;
export type ValueType = ItemValueType;
export type ValueTypes = ItemValueTypes;
export type Dataset = ItemDataset;
export type DatasetSchema = ItemDatasetSchema;
export type DatasetField = ItemDatasetField;
export type DatasetType = ItemDatasetType;
export type Layer = LayerType;
export type Asset = AssetType;
export type Mode = ModeType;

export type Widget = {
  enabled: boolean;
};

export type Props = {
  className?: string;
  propertyId?: string;
  mode: ModeType;
  items?: ItemItem[];
  title?: string;
  isTemplate?: boolean;
  isInfoboxCreatable?: boolean;
  onCreateInfobox?: () => void;
  onCreateAsset?: (files: FileList) => void;
  onRemovePane?: () => void;
  assets?: Asset[];
  selectedWidget?: Widget;
  onWidgetActivate?: (enabled: boolean) => Promise<void>;
} & Pick<
  PropertyItemProps,
  | "datasetSchemas"
  | "linkedDatasetSchemaId"
  | "linkedDatasetId"
  | "isCapturing"
  | "onIsCapturingChange"
  | "camera"
  | "onCameraChange"
  | "isLinkable"
  | "onDatasetPickerOpen"
  | "defaultItemName"
  | "layers"
> &
  ExtendedFuncProps<
    Pick<
      PropertyItemProps,
      | "onChange"
      | "onRemove"
      | "onLink"
      | "onUploadFile"
      | "onRemoveFile"
      | "onItemAdd"
      | "onItemMove"
      | "onItemRemove"
      | "onItemsUpdate"
    >,
    string
  >;

const PropertyPane: React.FC<Props> = ({
  className,
  propertyId,
  mode,
  items,
  isInfoboxCreatable,
  onCreateInfobox,
  onRemovePane,
  selectedWidget,
  onWidgetActivate,
  ...props
}) => {
  const theme = useTheme();
  const intl = useIntl();
  const visibleItems = items?.filter(i => {
    if (!i.only) return true;
    const res = searchField(items, i.only.field);
    return res && (res[1]?.value ?? res[0].defaultValue) === i.only.value;
  });

  const infoboxCreatable = !propertyId && mode === "infobox" && isInfoboxCreatable;

  const [eventProps, otherProps] = partitionObject(props, [
    "onChange",
    "onRemove",
    "onLink",
    "onUploadFile",
    "onRemoveFile",
    "onItemAdd",
    "onItemMove",
    "onItemRemove",
    "onItemsUpdate",
  ]);
  const events = useBind(eventProps, propertyId);
  return (
    <>
      {mode === "widget" && (
        <WidgetToggleButton
          checked={!!selectedWidget?.enabled}
          onChange={() => onWidgetActivate?.(!selectedWidget?.enabled)}
        />
      )}
      {((mode === "widget" && !!selectedWidget?.enabled) ||
        (mode !== "widget" && (propertyId || infoboxCreatable))) && (
        <Wrapper className={className}>
          {infoboxCreatable && (
            <StyledButton
              buttonType="primary"
              text={intl.formatMessage({ defaultMessage: "Create Infobox" })}
              onClick={onCreateInfobox}
            />
          )}
          {mode === "layer" && props.isTemplate && (
            <GroupWrapper
              className={className}
              name={intl.formatMessage({ defaultMessage: "Dataset" })}>
              <Text size="xs" color={theme.colors.text.strong}>
                {props.title}
              </Text>
            </GroupWrapper>
          )}
          {visibleItems?.map(item => (
            <PropertyItem
              key={`${propertyId}/${item.id || item.schemaGroup}`}
              item={item}
              onRemovePane={onRemovePane}
              mode={mode}
              {...events}
              {...otherProps}
            />
          ))}
        </Wrapper>
      )}
    </>
  );
};

const searchField = (
  items: ItemItem[],
  fid: string,
): [ItemSchemaField, ItemField | undefined] | undefined => {
  for (const i of items) {
    const sf2 = i.schemaFields.find(f => f.id === fid);
    if (!("fields" in i)) return;
    const field = i.fields.find(f => f.id === fid);
    if (sf2) {
      return [sf2, field];
    }
  }
  return;
};

const StyledButton = styled(Button)`
  float: right;
`;

export default PropertyPane;
