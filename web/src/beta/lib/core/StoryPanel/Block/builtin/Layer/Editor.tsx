import { debounce } from "lodash-es";
import { useContext, useMemo, useState, useCallback, useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import ColorField from "@reearth/beta/components/fields/ColorField";
import ListField from "@reearth/beta/components/fields/ListField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import TextField from "@reearth/beta/components/fields/TextField";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer/context";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import type { Field } from "../../../types";
import { BlockContext } from "../common/Wrapper";

export type LayerBlock = {
  id: string;
  title?: Field<string>;
  color?: Field<string>;
  bgColor?: Field<string>;
  showLayers?: Field<string[]>;
};

export type Props = {
  items: LayerBlock[];
  inEditor: boolean;
  onUpdate: (
    id: string,
    fieldId: keyof LayerBlock,
    fieldType: "string" | "array",
    value: string | string[] | undefined,
  ) => void;
  onItemRemove: (id: string) => void;
  onItemAdd: () => void;
  onItemMove: ({ id }: { id: string }, index: number) => void;
};

const LayerBlockEditor: React.FC<Props> = ({
  items,
  inEditor,
  onUpdate,
  onItemRemove,
  onItemAdd,
  onItemMove,
}) => {
  const t = useT();
  const context = useContext(BlockContext);
  const [selected, setSelected] = useState(items[0]?.id);

  const visualizer = useVisualizer();

  const layers = useMemo(
    () =>
      visualizer.current?.layers?.layers()?.map(({ id, title }) => ({
        key: id,
        label: title ?? `Layer: ${id}`,
      })),
    [visualizer],
  );

  const defaultTitle = useMemo(() => t("LOD"), [t]);

  const editorProperties = useMemo(() => items.find(i => i.id === selected), [items, selected]);

  const handleClick = useCallback(
    (itemId: string) => {
      if (inEditor) {
        setSelected(itemId);
        return;
      }
      const item = items.find(i => i.id === itemId);

      if (!item?.showLayers?.value) return;

      // Hide all layers
      const layers = visualizer.current?.layers;

      // Show only selected layers
      layers?.show(...item.showLayers.value);
      const allLayers = layers?.layers() ?? [];

      // Hide the rest
      layers?.hide(
        ...allLayers.map(({ id }) => id).filter(id => !item.showLayers?.value?.includes(id)),
      );
    },
    [inEditor, visualizer, items],
  );

  const debounceOnUpdate = useMemo(() => debounce(onUpdate, 500), [onUpdate]);

  const listItems = useMemo(
    () => items.map(({ id, title }) => ({ id, value: title?.value ?? defaultTitle })),
    [items, defaultTitle],
  );

  useEffect(() => {
    const currentVisualizer = visualizer?.current;
    return () => {
      const allLayers = currentVisualizer?.layers?.layers();
      if (!Array.isArray(allLayers)) return;
      // Show all the layers after the component is unmounted
      currentVisualizer?.layers.show(...allLayers.map(({ id }) => id));
    };
  }, [visualizer]);

  return (
    <Wrapper>
      <ButtonWrapper>
        {items.map(({ title, color, bgColor, id }) => {
          return (
            <StyledButton
              key={id}
              color={color?.value}
              bgColor={bgColor?.value}
              icon="cameraButtonStoryBlock"
              buttonType="primary"
              text={title?.value ?? defaultTitle}
              size="small"
              onClick={() => handleClick(id)}
            />
          );
        })}
      </ButtonWrapper>
      {context?.editMode && (
        <EditorWrapper>
          <ListField
            name={t("Buttons List")}
            items={listItems}
            addItem={onItemAdd}
            removeItem={onItemRemove}
            onItemDrop={onItemMove}
            selected={selected}
            onSelect={setSelected}
            atLeastOneItem
          />
          <FieldGroup disabled={!editorProperties}>
            <TextField
              name={editorProperties?.title?.title}
              description={editorProperties?.title?.description}
              value={editorProperties?.title?.value}
              onChange={value => debounceOnUpdate(selected, "title", "string", value)}
            />
            <ColorField
              name={editorProperties?.color?.title}
              description={editorProperties?.color?.description}
              value={editorProperties?.color?.value}
              onChange={value => debounceOnUpdate(selected, "color", "string", value)}
            />
            <ColorField
              name={editorProperties?.bgColor?.title}
              description={editorProperties?.bgColor?.description}
              value={editorProperties?.bgColor?.value}
              onChange={value => debounceOnUpdate(selected, "bgColor", "string", value)}
            />
            <SelectField
              name={editorProperties?.showLayers?.title}
              description={editorProperties?.showLayers?.description}
              options={layers}
              value={editorProperties?.showLayers?.value}
              onChange={value => debounceOnUpdate(selected, "showLayers", "array", value)}
              multiSelect
            />
          </FieldGroup>
        </EditorWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 4px;
  max-width: 400px;
  flex-wrap: wrap;
`;

const StyledButton = styled(Button)<{ color?: string; bgColor?: string }>`
  color: ${({ color }) => color};
  background-color: ${({ bgColor }) => bgColor};
  border-color: ${({ color }) => color};

  &:hover {
    color: ${({ bgColor }) => bgColor};
    background-color: ${({ color }) => color};
  }
`;

const EditorWrapper = styled.div`
  padding: 12px;
  margin: 2px 0;
  background: ${({ theme }) => theme.bg[1]};
`;

const FieldGroup = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "inherit")};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "inherit")};
`;

export default LayerBlockEditor;
