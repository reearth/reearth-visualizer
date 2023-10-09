import { useContext, useLayoutEffect, useMemo, useState } from "react";

import Button from "@reearth/beta/components/Button";
import CameraField from "@reearth/beta/components/fields/CameraField";
import ColorField from "@reearth/beta/components/fields/ColorField";
import TextField from "@reearth/beta/components/fields/TextField";
import { Camera } from "@reearth/beta/lib/core/engines";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { BlockContext } from "../common/Wrapper";

type CameraBlock = {
  title?: string;
  color?: string;
  bgColor?: string;
  cameraPosition?: Camera;
};

export type Props = {
  items: CameraBlock[];
  onUpdate: (index: number, fieldId: keyof CameraBlock, value: string | Camera) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
};

const CameraBlockEditor: React.FC<Props> = ({ items, onUpdate, onDeleteItem, onAddItem }) => {
  const t = useT();
  const context = useContext(BlockContext);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const editorProperties = useMemo(
    () => items.find((i, index) => index === selected),
    [items, selected],
  );

  useLayoutEffect(() => {
    if (!context?.editMode) {
      setEditorOpen(false);
    }
  }, [context?.editMode]);

  const handleClick = (index: number) => {
    if (!context?.editMode) {
      // TODO: Implement camera flyto event
      console.log("Camera fly to", index);
      return;
    }
    if (index === selected) {
      setEditorOpen(!editorOpen);
      return;
    }
    setSelected(index);
    setEditorOpen(true);
  };

  const showEditor = useMemo(() => {
    if (!context?.editMode) return false;
    if (items.length === 0) return true;
    if (!editorOpen) return false;
    return true;
  }, [editorOpen, context?.editMode, items]);

  return (
    <Wrapper>
      <ButtonWrapper>
        {items.map(({ title, color, bgColor }, index) => {
          return (
            <StyledButton
              key={index}
              color={color}
              bgColor={bgColor}
              icon="cameraButtonStoryBlock"
              buttonType="primary"
              text={title}
              size="small"
              onClick={() => handleClick(index)}
            />
          );
        })}
      </ButtonWrapper>
      {showEditor && (
        <EditorWrapper>
          <ButtonGroup>
            <Button
              icon="trash"
              buttonType="secondary"
              text="Remove"
              size="small"
              disabled={!!editorProperties}
              onClick={() => onDeleteItem(selected)}
            />
            <Button
              icon="plus"
              buttonType="primary"
              text="New Item"
              size="small"
              onClick={() => onAddItem()}
            />
          </ButtonGroup>
          {editorProperties && (
            <FieldGroup>
              <CameraField
                name={t("Camera pos")}
                value={editorProperties.cameraPosition}
                onSave={value => onUpdate(selected, "cameraPosition", value as Camera)}
                // TODO: Implement onFlyTo
              />
              <TextField
                name={t("Button Title")}
                value={editorProperties.title}
                onChange={value => onUpdate(selected, "title", value)}
              />
              <ColorField
                name={t("Button Color")}
                value={editorProperties.color}
                onChange={value => onUpdate(selected, "color", value)}
              />
              <ColorField
                name={t("Button Background Color")}
                value={editorProperties.bgColor}
                onChange={value => onUpdate(selected, "bgColor", value)}
              />
            </FieldGroup>
          )}
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;

  > button {
    width: 100%;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

export default CameraBlockEditor;
