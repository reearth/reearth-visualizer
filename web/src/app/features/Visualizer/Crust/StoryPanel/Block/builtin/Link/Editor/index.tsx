import {
  AssetField,
  ColorField,
  InputField,
  ListField
} from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks, { type LinkBlock } from "./hooks";

export { type LinkBlock } from "./hooks";

export type Props = {
  items: LinkBlock[];
  selected: string;
  propertyId?: string;
  setSelected: (id: string) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
};

const LinkBlockEditor: FC<Props> = ({
  items,
  propertyId,
  selected,
  setSelected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove
}) => {
  const t = useT();
  const {
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleItemAdd,
    handleItemRemove,
    handleItemMove
  } = useHooks({
    selected,
    items,
    propertyId,
    onPropertyUpdate,
    onPropertyItemAdd,
    onPropertyItemDelete,
    onPropertyItemMove
  });

  return (
    <EditorWrapper>
      <GroupWrapper>
        <ListField
          title={t("Buttons List")}
          items={listItems}
          selected={selected}
          onItemAdd={handleItemAdd}
          onItemDelete={handleItemRemove}
          onItemMove={handleItemMove}
          onItemSelect={setSelected}
          isEditable={false}
          atLeastOneItem
        />
        <FieldGroup disabled={!editorProperties}>
          <InputField
            title={editorProperties?.title?.title}
            description={editorProperties?.title?.description}
            value={editorProperties?.title?.value}
            onChangeComplete={(value) =>
              debounceOnUpdate(selected, "title", "string", value)
            }
          />
          <ColorField
            title={editorProperties?.color?.title}
            description={editorProperties?.color?.description}
            value={editorProperties?.color?.value}
            onChange={(value) =>
              debounceOnUpdate(selected, "color", "string", value)
            }
          />
          <ColorField
            title={editorProperties?.bgColor?.title}
            description={editorProperties?.bgColor?.description}
            value={editorProperties?.bgColor?.value}
            onChange={(value) =>
              debounceOnUpdate(selected, "bgColor", "string", value)
            }
          />
        </FieldGroup>
      </GroupWrapper>
      <AssetField
        title={editorProperties?.url?.title}
        description={editorProperties?.url?.description}
        inputMethod={"URL"}
        value={editorProperties?.url?.value?.toString() ?? ""}
        placeholder="http://"
        onChange={(value) => debounceOnUpdate(selected, "url", "url", value)}
      />
    </EditorWrapper>
  );
};

const EditorWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  margin: `${theme.spacing.micro}px 0`,
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const GroupWrapper = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "55% 42%",
  gridGap: "10px"
}));

const FieldGroup = styled("div")<{ disabled: boolean }>(
  ({ theme, disabled }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.small,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "inherit",
    pointerEvents: disabled ? "none" : "inherit"
  })
);

export default LinkBlockEditor;
