import { useReactiveVar } from "@apollo/client";
import { debounce } from "lodash-es";
import { useContext, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import CameraField from "@reearth/beta/components/fields/CameraField";
import ColorField from "@reearth/beta/components/fields/ColorField";
import ListField from "@reearth/beta/components/fields/ListField";
import TextField from "@reearth/beta/components/fields/TextField";
import { Camera } from "@reearth/beta/lib/core/engines";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer/context";
import { useT } from "@reearth/services/i18n";
import { currentCameraVar } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import { BlockContext } from "../common/Wrapper";

type CameraBlock = {
  id: string;
  title?: string;
  color?: string;
  bgColor?: string;
  cameraPosition?: Camera;
};

export type Props = {
  items: CameraBlock[];
  onUpdate: (
    id: string,
    fieldId: keyof CameraBlock,
    fieldType: "string" | "camera",
    value: string | Camera,
  ) => void;
  onItemRemove: (id: string) => void;
  onItemAdd: () => void;
  onItemMove: ({ id }: { id: string }, index: number) => void;
  inEditor: boolean;
};

const CameraBlockEditor: React.FC<Props> = ({
  items,
  onUpdate,
  onItemRemove,
  onItemAdd,
  onItemMove,
  inEditor,
}) => {
  const t = useT();
  const context = useContext(BlockContext);
  const [selected, setSelected] = useState(items[0]?.id);

  const visualizer = useVisualizer();
  const currentCamera = useReactiveVar(currentCameraVar);
  const handleFlyTo = useMemo(() => visualizer.current?.engine.flyTo, [visualizer]);

  const editorProperties = useMemo(() => items.find(i => i.id === selected), [items, selected]);

  const handleClick = (itemId: string) => {
    if (inEditor) {
      setSelected(itemId);
      return;
    }
    const item = items.find(i => i.id === itemId);
    if (!item?.cameraPosition) return;
    handleFlyTo?.(item.cameraPosition);
  };

  const debounceOnUpdate = useMemo(() => debounce(onUpdate, 500), [onUpdate]);

  const listItems = useMemo(
    () => items.map(({ id, title }) => ({ id, value: title ?? "New Camera" })),
    [items],
  );

  return (
    <Wrapper>
      <ButtonWrapper>
        {items.map(({ title, color, bgColor, id }) => {
          return (
            <StyledButton
              key={id}
              color={color}
              bgColor={bgColor}
              icon="cameraButtonStoryBlock"
              buttonType="primary"
              text={title ?? t("New Camera")}
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
            <CameraField
              name={t("Camera pos")}
              value={editorProperties?.cameraPosition}
              onSave={value => onUpdate(selected, "cameraPosition", "camera", value as Camera)}
              currentCamera={currentCamera}
              onFlyTo={handleFlyTo}
            />
            <TextField
              name={t("Button Title")}
              value={editorProperties?.title}
              onChange={value => debounceOnUpdate(selected, "title", "string", value)}
            />
            <ColorField
              name={t("Button Color")}
              value={editorProperties?.color}
              onChange={value => debounceOnUpdate(selected, "color", "string", value)}
            />
            <ColorField
              name={t("Button Background Color")}
              value={editorProperties?.bgColor}
              onChange={value => debounceOnUpdate(selected, "bgColor", "string", value)}
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

export default CameraBlockEditor;
